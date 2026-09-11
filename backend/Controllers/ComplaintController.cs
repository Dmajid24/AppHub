using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ComplaintsController : ControllerBase
    {
        private readonly AppDbContext _context;

        private static readonly Expression<
            Func<Complaint, ComplaintResponse>
        > ComplaintProjection = complaint =>
            new ComplaintResponse
            {
                Id = complaint.Id,
                FullName = complaint.FullName,
                Email = complaint.Email,
                Phone = complaint.Phone,
                Regional = complaint.Regional,
                IssueType = complaint.IssueType,
                ApplicationId = complaint.ApplicationId,
                ApplicationName =
                    complaint.Application.NamaAplikasi,
                Category = complaint.Category,
                LdapUsername = complaint.LdapUsername,
                Role = complaint.Role,
                Description = complaint.Description,
                Status = complaint.Status,
                ResolutionNote =
                    complaint.ResolutionNote,
                CreatedAt = complaint.CreatedAt,
                UpdatedAt = complaint.UpdatedAt,
                ResolvedAt = complaint.ResolvedAt
            };

        public ComplaintsController(
            AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Complaints
        [HttpGet]
        public async Task<
            ActionResult<IEnumerable<ComplaintResponse>>
        > GetComplaints(
            [FromQuery] string? status,
            [FromQuery] Guid? applicationId,
            [FromQuery] string? issueType,
            [FromQuery] string? regional,
            [FromQuery] string? search)
        {
            IQueryable<Complaint> query =
                _context.Complaints.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var selectedStatus = status.Trim();

                query = query.Where(complaint =>
                    complaint.Status == selectedStatus
                );
            }

            if (applicationId.HasValue)
            {
                query = query.Where(complaint =>
                    complaint.ApplicationId ==
                    applicationId.Value
                );
            }

            if (!string.IsNullOrWhiteSpace(issueType))
            {
                var selectedIssueType =
                    issueType.Trim();

                query = query.Where(complaint =>
                    complaint.IssueType ==
                    selectedIssueType
                );
            }

            if (!string.IsNullOrWhiteSpace(regional))
            {
                var selectedRegional =
                    regional.Trim();

                query = query.Where(complaint =>
                    complaint.Regional ==
                    selectedRegional
                );
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var pattern =
                    $"%{search.Trim()}%";

                query = query.Where(complaint =>
                    EF.Functions.ILike(
                        complaint.FullName,
                        pattern
                    )
                    ||
                    EF.Functions.ILike(
                        complaint.Email,
                        pattern
                    )
                    ||
                    EF.Functions.ILike(
                        complaint.Description,
                        pattern
                    )
                    ||
                    EF.Functions.ILike(
                        complaint.Application
                            .NamaAplikasi,
                        pattern
                    )
                );
            }

            var complaints = await query
                .OrderByDescending(complaint =>
                    complaint.CreatedAt
                )
                .Select(ComplaintProjection)
                .ToListAsync();

            return Ok(complaints);
        }

        // GET: api/Complaints/{id}
        [HttpGet("{id:guid}")]
        public async Task<
            ActionResult<ComplaintResponse>
        > GetComplaint(Guid id)
        {
            var complaint =
                await FindComplaintResponseAsync(id);

            if (complaint == null)
            {
                return NotFound(new
                {
                    message =
                        "Complaint tidak ditemukan"
                });
            }

            return Ok(complaint);
        }

        // POST: api/Complaints
        [HttpPost]
        public async Task<
            ActionResult<ComplaintResponse>
        > CreateComplaint(
            [FromBody] CreateComplaintRequest request)
        {
            if (request.ApplicationId == Guid.Empty)
            {
                return BadRequest(new
                {
                    message =
                        "Aplikasi wajib dipilih"
                });
            }

            var applicationExists =
                await _context.Applications.AnyAsync(
                    application =>
                        application.Id ==
                        request.ApplicationId
                );

            if (!applicationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Aplikasi tidak ditemukan"
                });
            }

            var complaint = new Complaint
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                Regional = request.Regional.Trim(),
                IssueType = request.IssueType.Trim(),

                ApplicationId =
                    request.ApplicationId,

                Category = NormalizeOptional(
                    request.Category
                ),

                LdapUsername = NormalizeOptional(
                    request.LdapUsername
                ),

                Role = NormalizeOptional(
                    request.Role
                ),

                Description =
                    request.Description.Trim(),

                Status =
                    ComplaintStatuses.Submitted,

                CreatedAt = DateTime.UtcNow
            };

            _context.Complaints.Add(complaint);

            await _context.SaveChangesAsync();

            var response =
                await FindComplaintResponseAsync(
                    complaint.Id
                );

            return CreatedAtAction(
                nameof(GetComplaint),
                new { id = complaint.Id },
                response
            );
        }

        // PUT: api/Complaints/{id}
        [HttpPut("{id:guid}")]
        public async Task<
            ActionResult<ComplaintResponse>
        > UpdateComplaint(
            Guid id,
            [FromBody] UpdateComplaintRequest request)
        {
            var complaint =
                await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound(new
                {
                    message =
                        "Complaint tidak ditemukan"
                });
            }

            if (request.ApplicationId == Guid.Empty)
            {
                return BadRequest(new
                {
                    message =
                        "Aplikasi wajib dipilih"
                });
            }

            var applicationExists =
                await _context.Applications.AnyAsync(
                    application =>
                        application.Id ==
                        request.ApplicationId
                );

            if (!applicationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Aplikasi tidak ditemukan"
                });
            }

            complaint.FullName =
                request.FullName.Trim();

            complaint.Email =
                request.Email.Trim();

            complaint.Phone =
                request.Phone.Trim();

            complaint.Regional =
                request.Regional.Trim();

            complaint.IssueType =
                request.IssueType.Trim();

            complaint.ApplicationId =
                request.ApplicationId;

            complaint.Category =
                NormalizeOptional(
                    request.Category
                );

            complaint.LdapUsername =
                NormalizeOptional(
                    request.LdapUsername
                );

            complaint.Role =
                NormalizeOptional(
                    request.Role
                );

            complaint.Description =
                request.Description.Trim();

            complaint.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(
                await FindComplaintResponseAsync(id)
            );
        }

        // PATCH: api/Complaints/{id}/status
        [HttpPatch("{id:guid}/status")]
        public async Task<
            ActionResult<ComplaintResponse>
        > UpdateComplaintStatus(
            Guid id,
            [FromBody]
            UpdateComplaintStatusRequest request)
        {
            if (!ComplaintStatuses.TryNormalize(
                    request.Status,
                    out var status))
            {
                return BadRequest(new
                {
                    message = "Status tidak valid",

                    allowedStatuses =
                        ComplaintStatuses.All
                });
            }

            var complaint =
                await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound(new
                {
                    message =
                        "Complaint tidak ditemukan"
                });
            }

            complaint.Status = status;

            complaint.ResolutionNote =
                NormalizeOptional(
                    request.ResolutionNote
                );

            complaint.UpdatedAt =
                DateTime.UtcNow;

            complaint.ResolvedAt =
                status == ComplaintStatuses.Resolved
                ||
                status == ComplaintStatuses.Closed
                    ? DateTime.UtcNow
                    : null;

            await _context.SaveChangesAsync();

            return Ok(
                await FindComplaintResponseAsync(id)
            );
        }

        // DELETE: api/Complaints/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult>
            DeleteComplaint(Guid id)
        {
            var complaint =
                await _context.Complaints.FindAsync(id);

            if (complaint == null)
            {
                return NotFound(new
                {
                    message =
                        "Complaint tidak ditemukan"
                });
            }

            _context.Complaints.Remove(complaint);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Complaints/summary
        [HttpGet("summary")]
        public async Task<IActionResult>
            GetComplaintSummary()
        {
            var totalComplaint =
                await _context.Complaints.CountAsync();

            var complaintSources =
                await _context.Complaints
                    .AsNoTracking()
                    .GroupBy(complaint => new
                    {
                        complaint.ApplicationId,

                        complaint.Application
                            .NamaAplikasi
                    })
                    .Select(group => new
                    {
                        label =
                            group.Key.NamaAplikasi,

                        value = group.Count()
                    })
                    .OrderByDescending(item =>
                        item.value
                    )
                    .ToListAsync();

            var topCategories =
                await _context.Complaints
                    .AsNoTracking()
                    .Where(complaint =>
                        complaint.Category != null
                        &&
                        complaint.Category !=
                        string.Empty
                    )
                    .GroupBy(complaint =>
                        complaint.Category
                    )
                    .Select(group => new
                    {
                        label = group.Key,
                        value = group.Count()
                    })
                    .OrderByDescending(item =>
                        item.value
                    )
                    .Take(5)
                    .ToListAsync();

            var resolutionStatus =
                await _context.Complaints
                    .AsNoTracking()
                    .GroupBy(complaint =>
                        complaint.Status
                    )
                    .Select(group => new
                    {
                        label = group.Key,
                        count = group.Count()
                    })
                    .OrderByDescending(item =>
                        item.count
                    )
                    .ToListAsync();

            return Ok(new
            {
                totalComplaint,
                complaintSources,
                topCategories,
                resolutionStatus
            });
        }

        private async Task<ComplaintResponse?>
            FindComplaintResponseAsync(Guid id)
        {
            return await _context.Complaints
                .AsNoTracking()
                .Where(complaint =>
                    complaint.Id == id
                )
                .Select(ComplaintProjection)
                .FirstOrDefaultAsync();
        }

        private static string? NormalizeOptional(
            string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? null
                : value.Trim();
        }
    }
}
