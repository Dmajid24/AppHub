using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using backend.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password);

        if (user == null)
            return Unauthorized(new { message = "Username atau password salah" });

        // ✅ Generate JWT
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.LevelAccess),
            new Claim("Nama", user.Nama),
            new Claim("NIK", user.NIK),
            new Claim("Telp", user.Telp),
            new Claim("LevelAccess", user.LevelAccess),
            new Claim("Department", user.Department),
            
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("AppHub_JWT_Secret_Key_2026_Minimum_32_Characters")); // ganti dengan key di appsettings
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "yourapp",
            audience: "yourapp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            message = "Login berhasil",
            token = tokenString,
            user = new { user.Id, user.Username, user.Email, user.Nama, user.NIK, user.Telp }
        });
    }

}
