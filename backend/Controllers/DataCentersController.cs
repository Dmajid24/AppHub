using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DataCentersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DataCentersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/DataCenters/map
        [HttpGet("map")]
        public async Task<IActionResult> GetMap()
        {
            var locations = await _context.DataCenters
                .AsNoTracking()
                .OrderBy(dc => dc.City)
                .ThenBy(dc => dc.Name)
                .Select(dc => new
                {
                    id = dc.Id,
                    name = dc.Name,
                    city = dc.City,
                    address = dc.Address,
                    latitude = dc.Latitude,
                    longitude = dc.Longitude,

                    totalServers = dc.Servers.Count(),

                    online = dc.Servers.Count(
                        server => server.Status == "Online"
                    ),

                    warning = dc.Servers.Count(
                        server => server.Status == "Warning"
                    ),

                    critical = dc.Servers.Count(
                        server => server.Status == "Critical"
                    ),

                    offline = dc.Servers.Count(
                        server => server.Status == "Offline"
                    ),

                    maintenance = dc.Servers.Count(
                        server => server.Status == "Maintenance"
                    )
                })
                .ToListAsync();

            var result = locations.Select(dc =>
            {
                var unknown = dc.totalServers
                    - dc.online
                    - dc.warning
                    - dc.critical
                    - dc.offline
                    - dc.maintenance;

                var status = GetLocationStatus(
                    dc.totalServers,
                    dc.warning,
                    dc.critical,
                    dc.offline,
                    dc.maintenance,
                    unknown
                );

                return new
                {
                    dc.id,
                    dc.name,
                    dc.city,
                    dc.address,
                    dc.latitude,
                    dc.longitude,
                    dc.totalServers,

                    status,

                    summary = new
                    {
                        healthy = dc.online,
                        dc.warning,
                        dc.critical,
                        dc.offline,
                        dc.maintenance,
                        unknown
                    }
                };
            }).ToList();

            return Ok(result);
        }


        // GET: api/DataCenters/{id}/servers
        [HttpGet("{id:guid}/servers")]
        public async Task<IActionResult> GetDataCenterServers(Guid id)
        {
            var dataCenter = await _context.DataCenters
                .AsNoTracking()
                .Where(dc => dc.Id == id)
                .Select(dc => new
                {
                    dc.Id,
                    dc.Name,
                    dc.City
                })
                .FirstOrDefaultAsync();

            if (dataCenter == null)
            {
                return NotFound(new
                {
                    message = "Data center tidak ditemukan"
                });
            }

            var servers = await _context.Servers
                .AsNoTracking()
                .Where(server => server.DataCenterId == id)
                .OrderBy(server => server.Hostname)
                .Select(server => new
                {
                    serverId = server.Id,
                    serverName = server.ServerName,
                    hostname = server.Hostname,
                    deviceIpAddress = server.IpAddress,
                    deviceType = server.DeviceType,
                    deviceTypeName = server.DeviceTypeName,
                    os = server.OperatingSystem,
                    environment = server.Environment,
                    rack = server.Rack,

                    cpuCore = server.CpuCore,
                    memoryGB = server.MemoryGB,
                    diskGB = server.DiskGB,

                    status = server.Status,
                    cpuUsage = server.CpuUsage,
                    memoryUsage = server.MemoryUsage,
                    diskUsage = server.DiskUsage,
                    availability = server.Availability,
                    responseTimeMs = server.ResponseTimeMs,
                    lastChecked = server.LastChecked,
                    alertLevel = server.AlertLevel,
                    description = server.Description,

                    applications = server.ApplicationServers
                        .OrderBy(link => link.Application.NamaAplikasi)
                        .Select(link => new
                        {
                            applicationId = link.ApplicationId,
                            name = link.Application.NamaAplikasi,
                            status = link.Application.Status,
                            tenantAplikasi = link.TenantAplikasi,
                            function = link.Function
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                dataCenterId = dataCenter.Id,
                name = dataCenter.Name,
                city = dataCenter.City,
                totalServers = servers.Count,
                servers
            });
        }

        private static string GetLocationStatus(
            int total,
            int warning,
            int critical,
            int offline,
            int maintenance,
            int unknown)
        {
            if (total == 0)
                return "Unknown";

            if (critical > 0 || offline > 0)
                return "Critical";

            if (warning > 0)
                return "Warning";

            if (unknown > 0)
                return "Unknown";

            if (maintenance > 0)
                return "Maintenance";

            return "Healthy";
        }
    }
}