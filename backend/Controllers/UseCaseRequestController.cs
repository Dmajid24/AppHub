using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UseCaseRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        private const long MaximumDocumentSize =
            10 * 1024 * 1024;

        private static readonly HashSet<string>
            AllowedDocumentExtensions =
                new(StringComparer.OrdinalIgnoreCase)
                {
                    ".pdf",
                    ".doc",
                    ".docx"
                };

        public UseCaseRequestsController(
            AppDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private async Task<User?> GetCurrentUserAsync()
        {
            var userIdClaim = User
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.Id == userId);
        }

        private static bool IsAdmin(User user)
        {
            return string.Equals(
                user.LevelAccess,
                "Admin",
                StringComparison.OrdinalIgnoreCase
            );
        }

        // GET: api/UseCaseRequests
        [HttpGet]
        public async Task<ActionResult<
            IEnumerable<UseCaseRequestResponseDto>>>
            GetUseCaseRequests()
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            IQueryable<UseCaseRequest> query =
                _context.UseCaseRequests
                    .AsNoTracking()
                    .Include(request => request.Application)
                    .Include(request => request.CreatedBy)
                    .Include(request => request.ReviewedBy);

            if (!IsAdmin(currentUser))
            {
                query = query.Where(request =>
                    request.CreatedById == currentUser.Id);
            }

            var requests = await query
                .OrderByDescending(request => request.CreatedAt)
                .ToListAsync();

            return Ok(requests.Select(ToResponse));
        }

        // GET: api/UseCaseRequests/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            IQueryable<UseCaseRequest> query =
                _context.UseCaseRequests.AsNoTracking();

            if (!IsAdmin(currentUser))
            {
                query = query.Where(request =>
                    request.CreatedById == currentUser.Id);
            }

            var totalRequests = await query.CountAsync();

            var submitted = await query.CountAsync(request =>
                request.Status == "Submitted");

            var inReview = await query.CountAsync(request =>
                request.Status == "In Review");

            var approved = await query.CountAsync(request =>
                request.Status == "Approved");

            var rejected = await query.CountAsync(request =>
                request.Status == "Rejected");

            return Ok(new
            {
                totalRequests,
                submitted,
                inReview,
                approved,
                rejected
            });
        }

        // GET: api/UseCaseRequests/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UseCaseRequestResponseDto>>
            GetUseCaseRequest(Guid id)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            var request = await _context.UseCaseRequests
                .AsNoTracking()
                .Include(item => item.Application)
                .Include(item => item.CreatedBy)
                .Include(item => item.ReviewedBy)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Use case request tidak ditemukan"
                });
            }

            if (!IsAdmin(currentUser) &&
                request.CreatedById != currentUser.Id)
            {
                return Forbid();
            }

            return Ok(ToResponse(request));
        }

        // POST: api/UseCaseRequests
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UseCaseRequestResponseDto>>
            CreateUseCaseRequest(
                [FromForm] CreateUseCaseRequestDto dto)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            if (dto.ApplicationId == Guid.Empty)
            {
                return BadRequest(new
                {
                    message = "ApplicationId wajib diisi"
                });
            }

            var applicationExists =
                await _context.Applications.AnyAsync(application =>
                    application.Id == dto.ApplicationId);

            if (!applicationExists)
            {
                return BadRequest(new
                {
                    message = "Aplikasi tidak ditemukan"
                });
            }

            var savedPaths = new List<string>();

            try
            {
                string? notaDinasFileName = null;
                string? notaDinasPath = null;

                string? businessRequirementFileName = null;
                string? businessRequirementPath = null;

                if (dto.NotaDinas != null)
                {
                    var savedNotaDinas =
                        await SaveDocumentAsync(dto.NotaDinas);

                    notaDinasFileName =
                        savedNotaDinas.OriginalFileName;

                    notaDinasPath =
                        savedNotaDinas.RelativePath;

                    savedPaths.Add(notaDinasPath);
                }

                if (dto.BusinessRequirement != null)
                {
                    var savedBusinessRequirement =
                        await SaveDocumentAsync(
                            dto.BusinessRequirement);

                    businessRequirementFileName =
                        savedBusinessRequirement.OriginalFileName;

                    businessRequirementPath =
                        savedBusinessRequirement.RelativePath;

                    savedPaths.Add(businessRequirementPath);
                }

                var request = new UseCaseRequest
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = dto.ApplicationId,
                    Pic = dto.Pic.Trim(),
                    UseCaseName = dto.UseCaseName.Trim(),
                    Description = dto.Description.Trim(),
                    Objective = dto.Objective.Trim(),
                    FeasibilityBenefit =
                        dto.FeasibilityBenefit.Trim(),
                    CustodyPic = dto.CustodyPic.Trim(),

                    NotaDinasFileName =
                        notaDinasFileName,
                    NotaDinasPath =
                        notaDinasPath,

                    BusinessRequirementFileName =
                        businessRequirementFileName,
                    BusinessRequirementPath =
                        businessRequirementPath,

                    Status = "Submitted",
                    CreatedById = currentUser.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UseCaseRequests.Add(request);
                await _context.SaveChangesAsync();

                await _context.Entry(request)
                    .Reference(item => item.Application)
                    .LoadAsync();

                await _context.Entry(request)
                    .Reference(item => item.CreatedBy)
                    .LoadAsync();

                return CreatedAtAction(
                    nameof(GetUseCaseRequest),
                    new { id = request.Id },
                    ToResponse(request)
                );
            }
            catch (InvalidOperationException exception)
            {
                foreach (var path in savedPaths)
                {
                    TryDeleteStoredFile(path);
                }

                return BadRequest(new
                {
                    message = exception.Message
                });
            }
            catch
            {
                foreach (var path in savedPaths)
                {
                    TryDeleteStoredFile(path);
                }

                throw;
            }
        }

        // PUT: api/UseCaseRequests/{id}
        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UseCaseRequestResponseDto>>
            UpdateUseCaseRequest(
                Guid id,
                [FromForm] UpdateUseCaseRequestDto dto)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            var request = await _context.UseCaseRequests
                .Include(item => item.Application)
                .Include(item => item.CreatedBy)
                .Include(item => item.ReviewedBy)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Use case request tidak ditemukan"
                });
            }

            var admin = IsAdmin(currentUser);

            if (!admin &&
                request.CreatedById != currentUser.Id)
            {
                return Forbid();
            }

            if (!admin &&
                request.Status != "Submitted")
            {
                return Conflict(new
                {
                    message =
                        "Request hanya dapat diubah ketika berstatus Submitted"
                });
            }

            var applicationExists =
                await _context.Applications.AnyAsync(application =>
                    application.Id == dto.ApplicationId);

            if (!applicationExists)
            {
                return BadRequest(new
                {
                    message = "Aplikasi tidak ditemukan"
                });
            }

            var newSavedPaths = new List<string>();

            var oldNotaDinasPath =
                request.NotaDinasPath;

            var oldBusinessRequirementPath =
                request.BusinessRequirementPath;

            try
            {
                if (dto.NotaDinas != null)
                {
                    var savedNotaDinas =
                        await SaveDocumentAsync(dto.NotaDinas);

                    request.NotaDinasFileName =
                        savedNotaDinas.OriginalFileName;

                    request.NotaDinasPath =
                        savedNotaDinas.RelativePath;

                    newSavedPaths.Add(
                        savedNotaDinas.RelativePath);
                }

                if (dto.BusinessRequirement != null)
                {
                    var savedBusinessRequirement =
                        await SaveDocumentAsync(
                            dto.BusinessRequirement);

                    request.BusinessRequirementFileName =
                        savedBusinessRequirement.OriginalFileName;

                    request.BusinessRequirementPath =
                        savedBusinessRequirement.RelativePath;

                    newSavedPaths.Add(
                        savedBusinessRequirement.RelativePath);
                }

                request.ApplicationId = dto.ApplicationId;
                request.Pic = dto.Pic.Trim();
                request.UseCaseName = dto.UseCaseName.Trim();
                request.Description = dto.Description.Trim();
                request.Objective = dto.Objective.Trim();
                request.FeasibilityBenefit =
                    dto.FeasibilityBenefit.Trim();
                request.CustodyPic = dto.CustodyPic.Trim();
                request.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                if (dto.NotaDinas != null)
                {
                    TryDeleteStoredFile(oldNotaDinasPath);
                }

                if (dto.BusinessRequirement != null)
                {
                    TryDeleteStoredFile(
                        oldBusinessRequirementPath);
                }

                await _context.Entry(request)
                    .Reference(item => item.Application)
                    .LoadAsync();

                return Ok(ToResponse(request));
            }
            catch (InvalidOperationException exception)
            {
                foreach (var path in newSavedPaths)
                {
                    TryDeleteStoredFile(path);
                }

                return BadRequest(new
                {
                    message = exception.Message
                });
            }
            catch
            {
                foreach (var path in newSavedPaths)
                {
                    TryDeleteStoredFile(path);
                }

                throw;
            }
        }

        // PATCH: api/UseCaseRequests/{id}/status
        [HttpPatch("{id:guid}/status")]
        public async Task<ActionResult<UseCaseRequestResponseDto>>
            UpdateStatus(
                Guid id,
                UpdateUseCaseStatusDto dto)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            if (!IsAdmin(currentUser))
            {
                return Forbid();
            }

            var request = await _context.UseCaseRequests
                .Include(item => item.Application)
                .Include(item => item.CreatedBy)
                .Include(item => item.ReviewedBy)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Use case request tidak ditemukan"
                });
            }

            request.Status = dto.Status;
            request.ReviewNote =
                string.IsNullOrWhiteSpace(dto.ReviewNote)
                    ? null
                    : dto.ReviewNote.Trim();

            request.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == "Approved" ||
                dto.Status == "Rejected")
            {
                request.ReviewedById = currentUser.Id;
                request.ReviewedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            await _context.Entry(request)
                .Reference(item => item.ReviewedBy)
                .LoadAsync();

            return Ok(ToResponse(request));
        }

        // DELETE: api/UseCaseRequests/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult>
            DeleteUseCaseRequest(Guid id)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            var request =
                await _context.UseCaseRequests
                    .FirstOrDefaultAsync(item => item.Id == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Use case request tidak ditemukan"
                });
            }

            var admin = IsAdmin(currentUser);

            if (!admin &&
                request.CreatedById != currentUser.Id)
            {
                return Forbid();
            }

            if (!admin &&
                request.Status != "Submitted")
            {
                return Conflict(new
                {
                    message =
                        "Request hanya dapat dihapus ketika berstatus Submitted"
                });
            }

            var notaDinasPath = request.NotaDinasPath;

            var businessRequirementPath =
                request.BusinessRequirementPath;

            _context.UseCaseRequests.Remove(request);
            await _context.SaveChangesAsync();

            TryDeleteStoredFile(notaDinasPath);

            TryDeleteStoredFile(
                businessRequirementPath);

            return NoContent();
        }

        // GET: api/UseCaseRequests/{id}/nota-dinas
        [HttpGet("{id:guid}/nota-dinas")]
        public async Task<IActionResult>
            DownloadNotaDinas(Guid id)
        {
            return await DownloadDocumentAsync(
                id,
                documentType: "nota-dinas"
            );
        }

        // GET: api/UseCaseRequests/{id}/business-requirement
        [HttpGet("{id:guid}/business-requirement")]
        public async Task<IActionResult>
            DownloadBusinessRequirement(Guid id)
        {
            return await DownloadDocumentAsync(
                id,
                documentType: "business-requirement"
            );
        }

        private async Task<IActionResult>
            DownloadDocumentAsync(
                Guid id,
                string documentType)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            var request =
                await _context.UseCaseRequests
                    .AsNoTracking()
                    .FirstOrDefaultAsync(item => item.Id == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Use case request tidak ditemukan"
                });
            }

            if (!IsAdmin(currentUser) &&
                request.CreatedById != currentUser.Id)
            {
                return Forbid();
            }

            string? relativePath;
            string? originalFileName;

            if (documentType == "nota-dinas")
            {
                relativePath = request.NotaDinasPath;
                originalFileName =
                    request.NotaDinasFileName;
            }
            else
            {
                relativePath =
                    request.BusinessRequirementPath;

                originalFileName =
                    request.BusinessRequirementFileName;
            }

            if (string.IsNullOrWhiteSpace(relativePath) ||
                string.IsNullOrWhiteSpace(originalFileName))
            {
                return NotFound(new
                {
                    message = "Dokumen tidak ditemukan"
                });
            }

            var fullPath =
                ResolveStoredFilePath(relativePath);

            if (fullPath == null ||
                !System.IO.File.Exists(fullPath))
            {
                return NotFound(new
                {
                    message = "File dokumen tidak ditemukan"
                });
            }

            return PhysicalFile(
                fullPath,
                GetContentType(originalFileName),
                originalFileName
            );
        }

        private async Task<(
            string OriginalFileName,
            string RelativePath)>
            SaveDocumentAsync(IFormFile document)
        {
            if (document.Length <= 0)
            {
                throw new InvalidOperationException(
                    "File dokumen kosong"
                );
            }

            if (document.Length > MaximumDocumentSize)
            {
                throw new InvalidOperationException(
                    "Ukuran dokumen maksimal 10 MB"
                );
            }

            var extension =
                Path.GetExtension(document.FileName);

            if (!AllowedDocumentExtensions.Contains(extension))
            {
                throw new InvalidOperationException(
                    "Format dokumen harus PDF, DOC, atau DOCX"
                );
            }

            var uploadDirectory = Path.Combine(
                _environment.ContentRootPath,
                "Uploads",
                "UseCaseRequests"
            );

            Directory.CreateDirectory(uploadDirectory);

            var storedFileName =
                $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

            var fullPath = Path.Combine(
                uploadDirectory,
                storedFileName
            );

            await using var fileStream =
                new FileStream(
                    fullPath,
                    FileMode.CreateNew,
                    FileAccess.Write
                );

            await document.CopyToAsync(fileStream);

            var relativePath = Path.GetRelativePath(
                _environment.ContentRootPath,
                fullPath
            );

            return (
                Path.GetFileName(document.FileName),
                relativePath
            );
        }

        private string? ResolveStoredFilePath(
            string relativePath)
        {
            var uploadRoot = Path.GetFullPath(
                Path.Combine(
                    _environment.ContentRootPath,
                    "Uploads",
                    "UseCaseRequests"
                )
            );

            var fullPath = Path.GetFullPath(
                Path.Combine(
                    _environment.ContentRootPath,
                    relativePath
                )
            );

            var allowedPrefix =
                uploadRoot + Path.DirectorySeparatorChar;

            if (!fullPath.StartsWith(
                    allowedPrefix,
                    StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return fullPath;
        }

        private void TryDeleteStoredFile(
            string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                return;
            }

            try
            {
                var fullPath =
                    ResolveStoredFilePath(relativePath);

                if (fullPath != null &&
                    System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }
            catch (IOException)
            {
                // Kegagalan menghapus file tidak membatalkan
                // perubahan data yang sudah tersimpan.
            }
            catch (UnauthorizedAccessException)
            {
                // File mungkin sedang digunakan proses lain.
            }
        }

        private static string GetContentType(
            string fileName)
        {
            return Path
                .GetExtension(fileName)
                .ToLowerInvariant() switch
            {
                ".pdf" =>
                    "application/pdf",

                ".doc" =>
                    "application/msword",

                ".docx" =>
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                _ =>
                    "application/octet-stream"
            };
        }

        private static UseCaseRequestResponseDto
            ToResponse(UseCaseRequest request)
        {
            return new UseCaseRequestResponseDto
            {
                Id = request.Id,
                ApplicationId = request.ApplicationId,
                ApplicationName =
                    request.Application?.NamaAplikasi
                    ?? string.Empty,

                Pic = request.Pic,
                UseCaseName = request.UseCaseName,
                Description = request.Description,
                Objective = request.Objective,
                FeasibilityBenefit =
                    request.FeasibilityBenefit,
                CustodyPic = request.CustodyPic,

                NotaDinasFileName =
                    request.NotaDinasFileName,

                NotaDinasDownloadUrl =
                    string.IsNullOrWhiteSpace(
                        request.NotaDinasPath)
                        ? null
                        : $"/api/UseCaseRequests/{request.Id}/nota-dinas",

                BusinessRequirementFileName =
                    request.BusinessRequirementFileName,

                BusinessRequirementDownloadUrl =
                    string.IsNullOrWhiteSpace(
                        request.BusinessRequirementPath)
                        ? null
                        : $"/api/UseCaseRequests/{request.Id}/business-requirement",

                Status = request.Status,
                ReviewNote = request.ReviewNote,

                CreatedById = request.CreatedById,
                CreatedByName =
                    request.CreatedBy?.Nama
                    ?? string.Empty,

                ReviewedById = request.ReviewedById,
                ReviewedByName =
                    request.ReviewedBy?.Nama,

                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt,
                ReviewedAt = request.ReviewedAt
            };
        }
    }
}