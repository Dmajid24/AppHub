using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public Guid Id { get; set; }

        // Null untuk Admin.
        // User biasa hanya punya akses ke satu Application.
        public Guid? ApplicationId { get; set; }

        [Required(ErrorMessage = "Username wajib diisi")]
        [StringLength(50, ErrorMessage = "Username maksimal 50 karakter")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "NIK wajib diisi")]
        [StringLength(20)]
        public string NIK { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nama wajib diisi")]
        [StringLength(100)]
        public string Nama { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password wajib diisi")]
        [StringLength(
            100,
            MinimumLength = 6,
            ErrorMessage = "Password minimal 6 karakter"
        )]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            "Admin|Read Only|Read And Write",
            ErrorMessage = "Level akses tidak valid"
        )]
        public string LevelAccess { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Format nomor telepon tidak valid")]
        public string? Telp { get; set; }

        [Required(ErrorMessage = "Department wajib diisi")]
        public string Department { get; set; } = string.Empty;

        [Required(ErrorMessage = "Alasan pengajuan wajib diisi")]
        public string AlasanPengajuan { get; set; } = string.Empty;

        public ICollection<UserApplicationAccess> ApplicationAccesses
            { get; set; } = new List<UserApplicationAccess>();

        // Relasi
        public Application? Application { get; set; }
    }
}