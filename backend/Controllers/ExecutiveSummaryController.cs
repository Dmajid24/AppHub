using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/executive-summary")]
    [Authorize]
    public class ExecutiveSummaryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExecutiveSummaryController(
            AppDbContext context)
        {
            _context = context;
        }

        // GET: api/executive-summary
        [HttpGet]
        public async Task<IActionResult> GetExecutiveSummary()
        {
            var totalApplications = await _context.Applications.CountAsync();

            var criticalAlerts = await _context.Complaints.CountAsync(
                complaint => complaint.IssueType == "Aplication Error"
            );

            var averageHealth = await _context.Applications
                .Where(application => application.Uptime.HasValue)
                .AverageAsync(application => application.Uptime) ?? 0m;

            averageHealth = Math.Round(averageHealth, 1);

            return Ok(new
            {
                totalApplications,
                criticalAlerts,
                averageHealth
            });
        }
    }
}