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
