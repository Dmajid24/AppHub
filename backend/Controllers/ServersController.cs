using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/servers
    [HttpGet]
    public async Task<IActionResult> GetServers()
    {
        var servers = await _context.Servers
            .AsNoTracking()
            .Include(server => server.DataCenter)
            .Include(server => server.ApplicationServers)
                .ThenInclude(link => link.Application)
            .OrderBy(server => server.DataCenter.City)
            .ThenBy(server => server.DataCenter.Name)
            .ThenBy(server => server.Hostname)
            .ToListAsync();

        return Ok(servers);
    }

    // GET: api/Servers/{id}
    [Authorize(Roles = "Admin")]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetServer(Guid id)
    {
        var server = await _context.Servers
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new
            {
                serverId = item.Id,
                serverName = item.ServerName,
                hostname = item.Hostname,
                deviceIpAddress = item.IpAddress,
                deviceType = item.DeviceType,
                deviceTypeName = item.DeviceTypeName,
                os = item.OperatingSystem,
                environment = item.Environment,
                rack = item.Rack,
                description = item.Description,

                // Kapasitas server.
                cpuCore = item.CpuCore,
                memoryGB = item.MemoryGB,
                diskGB = item.DiskGB,

                // Snapshot kesehatan server.
                status = item.Status,
                cpuUsage = item.CpuUsage,
                memoryUsage = item.MemoryUsage,
                diskUsage = item.DiskUsage,
                availability = item.Availability,
                responseTimeMs = item.ResponseTimeMs,
                lastChecked = item.LastChecked,
                alertLevel = item.AlertLevel,

                dataCenter = new
                {
                    id = item.DataCenter.Id,
                    name = item.DataCenter.Name,
                    city = item.DataCenter.City,
                    address = item.DataCenter.Address,
                    latitude = item.DataCenter.Latitude,
                    longitude = item.DataCenter.Longitude
                },

                totalApplications = item.ApplicationServers.Count(),

                applications = item.ApplicationServers
                    .OrderBy(link => link.Application.NamaAplikasi)
                    .Select(link => new
                    {
                        applicationId = link.ApplicationId,
                        name = link.Application.NamaAplikasi,
                        category = link.Application.Category,
                        status = link.Application.Status,
                        tenantAplikasi = link.TenantAplikasi,
                        function = link.Function
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (server == null)
        {
            return NotFound(new
            {
                message = "Server tidak ditemukan"
            });
        }

        return Ok(server);
    }
    // GET: api/Servers/{id}/application-impact
    [Authorize(Roles = "Admin")]
    [HttpGet("{id:guid}/application-impact")]
    public async Task<IActionResult> GetApplicationImpact(Guid id)
    {
        // Identitas dan snapshot server yang sedang diperiksa.
        var server = await _context.Servers
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new
            {
                serverId = item.Id,
                hostname = item.Hostname,
                serverName = item.ServerName,
                deviceIpAddress = item.IpAddress,
                status = item.Status,
                lastChecked = item.LastChecked,
                dataCenterName = item.DataCenter.Name,
                city = item.DataCenter.City
            })
            .FirstOrDefaultAsync();

        if (server == null)
        {
            return NotFound(new
            {
                message = "Server tidak ditemukan"
            });
        }

        // Aplikasi yang memiliki relasi dengan server ini.
        var linkedApplications = await _context.Set<ApplicationServer>()
            .AsNoTracking()
            .Where(link => link.ServerId == id)
            .OrderBy(link => link.Application.NamaAplikasi)
            .Select(link => new
            {
                applicationId = link.ApplicationId,
                name = link.Application.NamaAplikasi,
                category = link.Application.Category,
                applicationStatus = link.Application.Status,
                tenantAplikasi = link.TenantAplikasi,
                function = link.Function
            })
            .ToListAsync();

        var applicationIds = linkedApplications
            .Select(app => app.applicationId)
            .ToList();

        // Ambil seluruh server pendukung aplikasi terkait sekaligus.
        // Tidak melakukan query tambahan untuk setiap aplikasi.
        var supportingServers = await _context.Set<ApplicationServer>()
            .AsNoTracking()
            .Where(link => applicationIds.Contains(link.ApplicationId))
            .OrderBy(link => link.Server.Hostname)
            .Select(link => new
            {
                applicationId = link.ApplicationId,
                serverId = link.ServerId,
                hostname = link.Server.Hostname,
                deviceIpAddress = link.Server.IpAddress,
                status = link.Server.Status,
                environment = link.Server.Environment,
                lastChecked = link.Server.LastChecked,
                tenantAplikasi = link.TenantAplikasi,
                function = link.Function,
                dataCenterId = link.Server.DataCenterId,
                dataCenterName = link.Server.DataCenter.Name,
                city = link.Server.DataCenter.City
            })
            .ToListAsync();

        // Klasifikasi perhatian berdasarkan status tersimpan.
        // Tidak menggunakan IsCritical karena maknanya belum
        // ditetapkan sebagai kondisi kesehatan atau kepentingan server.
        string ClassifyStatus(string? status)
        {
            return status?.Trim().ToUpperInvariant() switch
            {
                "ONLINE" => "Normal",
                "WARNING" => "Warning",
                "CRITICAL" => "Critical",
                "OFFLINE" => "Critical",
                "MAINTENANCE" => "Maintenance",
                _ => "Unknown"
            };
        }

        var sourceAttention = ClassifyStatus(server.status);

        var assessmentMessage = sourceAttention switch
        {
            "Critical" =>
                "Server terkait berstatus Critical atau Offline. " +
                "Prioritaskan pemeriksaan aplikasi; dampak layanan belum terverifikasi.",

            "Warning" =>
                "Server terkait berstatus Warning. " +
                "Periksa layanan aplikasi yang menggunakan server ini.",

            "Maintenance" =>
                "Server terkait sedang Maintenance. " +
                "Periksa jadwal pemeliharaan dan kesiapan layanan pengganti.",

            "Normal" =>
                "Snapshot server terkait berstatus Online. " +
                "Status ini belum membuktikan seluruh layanan aplikasi berjalan normal.",

            _ =>
                "Kondisi server terkait belum dapat dinilai dari status yang tersedia."
        };

        var serversByApplication = supportingServers
            .ToLookup(item => item.applicationId);

        var applications = linkedApplications.Select(app =>
        {
            var allServers = serversByApplication[app.applicationId]
                .ToList();

            var otherServers = allServers
                .Where(item => item.serverId != id)
                .ToList();

            return new
            {
                app.applicationId,
                app.name,
                app.category,
                app.applicationStatus,

                // Fungsi dan tenant adalah atribut relasi aplikasi-server.
                sourceRelation = new
                {
                    app.tenantAplikasi,
                    app.function
                },

                assessment = new
                {
                    attentionLevel = sourceAttention,
                    serviceImpact = "Unverified",
                    redundancyStatus = "NotAssessed",
                    message = assessmentMessage,
                    supportingServerNote = otherServers.Count == 0
                        ? "Tidak ada server lain yang tercatat untuk aplikasi ini. " +
                        "Kelengkapan inventaris perlu dikonfirmasi."
                        : "Ada server lain yang terkait dengan aplikasi ini. " +
                        "Peran, tenant, dan kesiapan failover perlu diperiksa " +
                        "sebelum menyimpulkan adanya cadangan."
                },

                totalServers = allServers.Count,

                // Ringkasan seluruh server aplikasi, termasuk server terpilih.
                serverSummary = new
                {
                    online = allServers.Count(item =>
                        ClassifyStatus(item.status) == "Normal"),

                    warning = allServers.Count(item =>
                        ClassifyStatus(item.status) == "Warning"),

                    criticalOrOffline = allServers.Count(item =>
                        ClassifyStatus(item.status) == "Critical"),

                    maintenance = allServers.Count(item =>
                        ClassifyStatus(item.status) == "Maintenance"),

                    unknown = allServers.Count(item =>
                        ClassifyStatus(item.status) == "Unknown")
                },

                otherServers
            };
        }).ToList();

        return Ok(new
        {
            sourceServer = server,
            assessmentBasis = "StoredServerStatus",
            sourceAttentionLevel = sourceAttention,
            totalLinkedApplications = applications.Count,
            note =
                "Analisis relasi berdasarkan snapshot tersimpan. " +
                "Bukan hasil pemeriksaan langsung terhadap layanan aplikasi. " +
                "Waktu snapshot tersedia pada lastChecked setiap server.",
            applications
        });
    }
    [HttpPost]
    public async Task<IActionResult> CreateServer([FromBody] Server server)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        server.Id = Guid.NewGuid();
        server.LastChecked = DateTime.UtcNow;

        _context.Servers.Add(server);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServer), new { id = server.Id }, server);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServer(Guid id, [FromBody] Server server)
    {
        if (id != server.Id) return BadRequest("Id tidak cocok");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        server.LastChecked = DateTime.UtcNow;
        _context.Entry(server).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Servers.Any(s => s.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }


    // DELETE: api/servers/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServer(Guid id)
    {
        var server = await _context.Servers.FindAsync(id);
        if (server == null) return NotFound();

        _context.Servers.Remove(server);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
