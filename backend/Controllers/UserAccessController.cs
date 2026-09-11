using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UserAccessController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserAccessController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserAccess/{userId}
        // Mengambil semua whitelist aktif milik user
        [HttpGet("{userId:guid}")]
        public async Task<IActionResult> GetUserAccess(Guid userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.Id == userId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User tidak ditemukan"
                });
            }

            var accesses = await _context.UserApplicationAccesses
                .AsNoTracking()
                .Where(access =>
                    access.UserId == userId &&
                    access.IsActive)
                .Select(access => new
                {
                    access.UserId,
                    access.ApplicationId,
                    access.AccessLevel,
                    access.GrantedAt,
                    access.GrantedBy,
                    access.IsActive,

                    Application = new
                    {
                        access.Application.Id,
                        access.Application.NamaAplikasi,
                        access.Application.Category,
                        access.Application.Status,
                        access.Application.ApplicationUrl
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                User = new
                {
                    user.Id,
                    user.Username,
                    user.Nama,
                    user.Email,
                    user.Department,
                    user.LevelAccess
                },

                WhitelistedApplications = accesses
            });
        }

        // POST: api/UserAccess
        // Memberikan whitelist aplikasi kepada user
        [HttpPost]
        public async Task<IActionResult> GrantAccess(
            [FromBody] GrantUserAccessRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.UserId == Guid.Empty ||
                request.ApplicationId == Guid.Empty)
            {
                return BadRequest(new
                {
                    message = "UserId dan ApplicationId wajib diisi"
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(user =>
                    user.Id == request.UserId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User tidak ditemukan"
                });
            }

            var application = await _context.Applications
                .FirstOrDefaultAsync(application =>
                    application.Id == request.ApplicationId);

            if (application == null)
            {
                return NotFound(new
                {
                    message = "Aplikasi tidak ditemukan"
                });
            }

            // Admin tidak membutuhkan whitelist
            if (string.Equals(
                    user.LevelAccess,
                    "Admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Admin sudah dapat mengakses semua aplikasi"
                });
            }

            // User sudah mendapatkan akses otomatis dari department
            if (string.Equals(
                    user.Department,
                    application.Category,
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "User sudah memiliki akses otomatis melalui department"
                });
            }

            var adminIdClaim = User
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

            if (!Guid.TryParse(adminIdClaim, out var adminId))
            {
                return Unauthorized(new
                {
                    message = "Data Admin pada token tidak ditemukan"
                });
            }

            var existingAccess =
                await _context.UserApplicationAccesses
                    .FirstOrDefaultAsync(access =>
                        access.UserId == request.UserId &&
                        access.ApplicationId ==
                            request.ApplicationId);

            // Jika whitelist pernah dicabut, aktifkan kembali
            if (existingAccess != null)
            {
                if (existingAccess.IsActive)
                {
                    return Conflict(new
                    {
                        message =
                            "User sudah memiliki whitelist untuk aplikasi ini"
                    });
                }

                existingAccess.IsActive = true;
                existingAccess.AccessLevel = request.AccessLevel;
                existingAccess.GrantedAt = DateTime.UtcNow;
                existingAccess.GrantedBy = adminId;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Akses aplikasi berhasil diaktifkan kembali",
                    access = new
                    {
                        existingAccess.UserId,
                        existingAccess.ApplicationId,
                        existingAccess.AccessLevel,
                        existingAccess.GrantedAt,
                        existingAccess.GrantedBy,
                        existingAccess.IsActive
                    }
                });
            }

            var newAccess = new UserApplicationAccess
            {
                UserId = request.UserId,
                ApplicationId = request.ApplicationId,
                AccessLevel = request.AccessLevel,
                GrantedAt = DateTime.UtcNow,
                GrantedBy = adminId,
                IsActive = true
            };

            _context.UserApplicationAccesses.Add(newAccess);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUserAccess),
                new { userId = request.UserId },
                new
                {
                    message = "Akses aplikasi berhasil diberikan",
                    access = new
                    {
                        newAccess.UserId,
                        newAccess.ApplicationId,
                        newAccess.AccessLevel,
                        newAccess.GrantedAt,
                        newAccess.GrantedBy,
                        newAccess.IsActive
                    }
                }
            );
        }

        // DELETE: api/UserAccess/{userId}/{applicationId}
        // Mencabut whitelist aplikasi
        [HttpDelete("{userId:guid}/{applicationId:guid}")]
        public async Task<IActionResult> RevokeAccess(
            Guid userId,
            Guid applicationId)
        {
            var access = await _context.UserApplicationAccesses
                .FirstOrDefaultAsync(access =>
                    access.UserId == userId &&
                    access.ApplicationId == applicationId);

            if (access == null || !access.IsActive)
            {
                return NotFound(new
                {
                    message = "Whitelist aplikasi tidak ditemukan"
                });
            }

            // Soft delete agar riwayat pemberian akses tidak hilang
            access.IsActive = false;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Akses aplikasi berhasil dicabut"
            });
        }
    }

    public class GrantUserAccessRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ApplicationId { get; set; }

        [Required]
        [RegularExpression(
            "^(Read Only|Read And Write)$",
            ErrorMessage =
                "AccessLevel harus Read Only atau Read And Write"
        )]
        public string AccessLevel { get; set; } = "Read Only";
    }
}