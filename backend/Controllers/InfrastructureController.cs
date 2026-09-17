using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/infrastructure")]
[Authorize(Roles = "Admin")]
public class InfrastructureController : ControllerBase
{
    private readonly AppDbContext _context;

    public InfrastructureController(AppDbContext context) => _context = context;

    // One database projection supplies both the map and all page summaries.
    // These are stored readings, not a live probe or a historical average.
    [HttpGet]
    public async Task<IActionResult> GetInfrastructure(CancellationToken cancellationToken)
    {
        var dataCenters = await _context.DataCenters
            .AsNoTracking()
            .AsSingleQuery()
            .OrderBy(dc => dc.City).ThenBy(dc => dc.Name)
            .Select(dc => new
            {
                id = dc.Id,
                name = dc.Name,
                city = dc.City,
                address = dc.Address,
                latitude = dc.Latitude,
                longitude = dc.Longitude,
                servers = dc.Servers.OrderBy(s => s.Hostname).Select(s => new
                {
                    serverId = s.Id,
                    serverName = s.ServerName,
                    hostname = s.Hostname,
                    deviceIpAddress = s.IpAddress,
                    deviceType = s.DeviceType,
                    deviceTypeName = s.DeviceTypeName,
                    os = s.OperatingSystem,
                    environment = s.Environment,
                    rack = s.Rack,
                    cpuCore = s.CpuCore,
                    memoryGB = s.MemoryGB,
                    diskGB = s.DiskGB,
                    status = s.Status,
                    cpuUsage = s.CpuUsage,
                    memoryUsage = s.MemoryUsage,
                    diskUsage = s.DiskUsage,
                    availability = s.Availability,
                    responseTimeMs = s.ResponseTimeMs,
                    lastChecked = s.LastChecked,
                    alertLevel = s.AlertLevel,
                    description = s.Description,
                    applications = s.ApplicationServers
                        .OrderBy(link => link.Application.NamaAplikasi)
                        .Select(link => new
                        {
                            applicationId = link.ApplicationId,
                            name = link.Application.NamaAplikasi,
                            status = link.Application.Status,
                            tenantAplikasi = link.TenantAplikasi,
                            function = link.Function
                        }).ToList()
                }).ToList()
            }).ToListAsync(cancellationToken);

        return Ok(new { retrievedAt = DateTime.UtcNow, dataCenters });
    }
}
