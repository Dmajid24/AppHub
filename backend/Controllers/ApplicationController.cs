using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApplicationsController(AppDbContext context)
        {
            _context = context;
        }

        // Mengambil data user yang sedang login dari JWT
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

        // GET: api/Applications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Application>>>
            GetApplications()
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            IQueryable<Application> query = _context.Applications
                .AsNoTracking()
                .Include(application => application.ApplicationServers)
                    .ThenInclude(link => link.Server)
                        .ThenInclude(server => server.DataCenter)
                .Include(application => application.Pemilik)
                .Include(application => application.Pembuat)
                .Include(application => application.BackupPemilik);

            // Admin dapat melihat seluruh aplikasi
            if (!string.Equals(
                    currentUser.LevelAccess,
                    "Admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                // User biasa hanya melihat aplikasi
                // dengan kategori sesuai department-nya
                query = query.Where(application =>
                    application.Category == currentUser.Department
                    ||
                    _context.UserApplicationAccesses.Any(access =>
                        access.UserId == currentUser.Id &&
                        access.ApplicationId == application.Id &&
                        access.IsActive
                    )
                );
            }

            var applications = await query.ToListAsync();

            return Ok(applications);
        }

        // GET: api/Applications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Application>>
            GetApplication(Guid id)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            IQueryable<Application> query = _context.Applications
                .AsNoTracking()
                .Include(application => application.ApplicationServers)
                    .ThenInclude(link => link.Server)
                        .ThenInclude(server => server.DataCenter)
                .Include(application => application.Pemilik)
                .Include(application => application.Pembuat)
                .Include(application => application.BackupPemilik);

            // Detail aplikasi juga harus dibatasi
            if (!string.Equals(
                    currentUser.LevelAccess,
                    "Admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(application =>
                    application.Category == currentUser.Department
                    ||
                    _context.UserApplicationAccesses.Any(access =>
                        access.UserId == currentUser.Id &&
                        access.ApplicationId == application.Id &&
                        access.IsActive
                    )
                );
            }

            var application = await query
                .FirstOrDefaultAsync(application =>
                    application.Id == id);

            if (application == null)
            {
                return NotFound(new
                {
                    message = "Aplikasi tidak ditemukan atau tidak dapat diakses"
                });
            }

            return Ok(application);
        }

        // GET: api/Applications/{id}/servers
        [HttpGet("{id:guid}/servers")]
        public async Task<IActionResult> GetApplicationServers(Guid id)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            // Gunakan aturan akses yang sama dengan detail aplikasi.
            IQueryable<Application> applicationQuery = _context.Applications
                .AsNoTracking();

            var isAdmin = string.Equals(
                currentUser.LevelAccess,
                "Admin",
                StringComparison.OrdinalIgnoreCase
            );

            if (!isAdmin)
            {
                applicationQuery = applicationQuery.Where(application =>
                    application.Category == currentUser.Department
                    ||
                    _context.UserApplicationAccesses.Any(access =>
                        access.UserId == currentUser.Id &&
                        access.ApplicationId == application.Id &&
                        access.IsActive
                    )
                );
            }

            var canAccessApplication = await applicationQuery
                .AnyAsync(application => application.Id == id);

            if (!canAccessApplication)
            {
                return NotFound(new
                {
                    message = "Aplikasi tidak ditemukan atau tidak dapat diakses"
                });
            }

            // Ambil hanya field yang dibutuhkan tabel Tech Info.
            var servers = await _context.ApplicationServers
                .AsNoTracking()
                .Where(link => link.ApplicationId == id)
                .OrderBy(link => link.Server.DataCenter.City)
                .ThenBy(link => link.Server.DataCenter.Name)
                .ThenBy(link => link.Server.Hostname)
                .Select(link => new
                {
                    serverId = link.ServerId,
                    applicationId = link.ApplicationId,

                    tenantAplikasi = link.TenantAplikasi,
                    deviceIpAddress = link.Server.IpAddress,
                    deviceType = link.Server.DeviceType,
                    deviceTypeName = link.Server.DeviceTypeName,
                    os = link.Server.OperatingSystem,
                    function = link.Function,

                    cpuCore = link.Server.CpuCore,
                    memoryGB = link.Server.MemoryGB,
                    diskGB = link.Server.DiskGB,

                    dataCenterId = link.Server.DataCenterId,
                    serverLocation = link.Server.DataCenter.Name,
                    city = link.Server.DataCenter.City,
                    hostname = link.Server.Hostname
                })
                .ToListAsync();

            return Ok(servers);
        }

        // GET: api/Applications/{id}/data-quality
        [HttpGet("{id:guid}/data-quality")]
        public async Task<IActionResult> GetApplicationDataQuality(Guid id)
        {
            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            IQueryable<Application> query = _context.Applications
                .AsNoTracking();

            var isAdmin = string.Equals(
                currentUser.LevelAccess,
                "Admin",
                StringComparison.OrdinalIgnoreCase
            );

            // Aturan akses sama dengan detail aplikasi.
            if (!isAdmin)
            {
                query = query.Where(application =>
                    application.Category == currentUser.Department
                    ||
                    _context.UserApplicationAccesses.Any(access =>
                        access.UserId == currentUser.Id &&
                        access.ApplicationId == application.Id &&
                        access.IsActive
                    )
                );
            }

            // Hanya mengambil informasi yang diperlukan.
            var app = await query
                .Where(application => application.Id == id)
                .Select(application => new
                {
                    application.Id,
                    application.NamaAplikasi,
                    application.Description,
                    application.ApplicationUrl,
                    application.IdPemilik,
                    application.IdBackupPemilik,
                    application.DataClassification,
                    application.DataSource,
                    application.DataRetentionPolicy,
                    application.Version,
                    application.Database,
                    application.TechnologyStack
                })
                .FirstOrDefaultAsync();

            if (app == null)
            {
                return NotFound(new
                {
                    message = "Aplikasi tidak ditemukan atau tidak dapat diakses"
                });
            }

            bool HasText(string? value)
            {
                return !string.IsNullOrWhiteSpace(value);
            }

            bool HasUserId(Guid? value)
            {
                return value.HasValue && value.Value != Guid.Empty;
            }

            // Aturan demo: setiap informasi memiliki bobot yang sama.
            // Tidak mengubah ketentuan Required pada model aplikasi.
            var checks = new[]
            {
                new
                {
                    key = "description",
                    label = "Deskripsi",
                    isComplete = HasText(app.Description)
                },
                new
                {
                    key = "applicationUrl",
                    label = "URL aplikasi",
                    isComplete = HasText(app.ApplicationUrl)
                },
                new
                {
                    key = "owner",
                    label = "PIC utama",
                    isComplete = HasUserId(app.IdPemilik)
                },
                new
                {
                    key = "backupOwner",
                    label = "Backup PIC",
                    isComplete = HasUserId(app.IdBackupPemilik)
                },
                new
                {
                    key = "dataClassification",
                    label = "Klasifikasi data",
                    isComplete = HasText(app.DataClassification)
                },
                new
                {
                    key = "dataSource",
                    label = "Sumber data",
                    isComplete = HasText(app.DataSource)
                },
                new
                {
                    key = "dataRetentionPolicy",
                    label = "Kebijakan retensi",
                    isComplete = HasText(app.DataRetentionPolicy)
                },
                new
                {
                    key = "version",
                    label = "Versi aplikasi",
                    isComplete = HasText(app.Version)
                },
                new
                {
                    key = "database",
                    label = "Database",
                    isComplete = HasText(app.Database)
                },
                new
                {
                    key = "technologyStack",
                    label = "Teknologi",
                    isComplete = HasText(app.TechnologyStack)
                }
            };

            var totalFields = checks.Length;
            var completedFields = checks.Count(check => check.isComplete);
            var missingFields = checks
                .Where(check => !check.isComplete)
                .Select(check => new
                {
                    check.key,
                    check.label
                })
                .ToList();

            var completenessPercentage = Math.Round(
                completedFields * 100m / totalFields,
                1,
                MidpointRounding.AwayFromZero
            );

            return Ok(new
            {
                applicationId = app.Id,
                applicationName = app.NamaAplikasi,

                ruleSet = "ApplicationCompletenessDemoV1",
                assessmentType = "FieldPresence",

                totalFields,
                completedFields,
                missingFieldCount = missingFields.Count,
                completenessPercentage,

                status = missingFields.Count == 0
                    ? "Complete"
                    : "Incomplete",

                statusLabel = missingFields.Count == 0
                    ? "Informasi terisi lengkap"
                    : "Informasi perlu dilengkapi",

                checks,
                missingFields,

                note =
                    "Penilaian berdasarkan keterisian 10 informasi dengan bobot sama. " +
                    "Tidak memastikan kebenaran, validitas URL, atau kemutakhiran data. " +
                    "Aturan demo perlu disesuaikan dengan kebutuhan tim."
            });
        }

        // POST: api/Applications
        [HttpPost]
        public async Task<ActionResult<Application>>
            PostApplication(Application application)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUser = await GetCurrentUserAsync();

            if (currentUser == null)
            {
                return Unauthorized(new
                {
                    message = "Data user pada token tidak ditemukan"
                });
            }

            application.Id = Guid.NewGuid();
            application.CreatedAt = DateTime.UtcNow;
            application.IdPembuat = currentUser.Id;

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetApplication),
                new { id = application.Id },
                application
            );
        }

        // PUT: api/Applications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutApplication(
            Guid id,
            Application application)
        {
            if (id != application.Id)
            {
                return BadRequest("Id tidak cocok");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            application.LastUpdated = DateTime.UtcNow;

            _context.Entry(application).State =
                EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var applicationExists =
                    await _context.Applications.AnyAsync(
                        item => item.Id == id);

                if (!applicationExists)
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/Applications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(Guid id)
        {
            var application =
                await _context.Applications.FindAsync(id);

            if (application == null)
            {
                return NotFound();
            }

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}