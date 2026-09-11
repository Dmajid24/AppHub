using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace backend.Models
{
    public class Complaint
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Nama lengkap wajib diisi")]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nomor handphone wajib diisi")]
        [Phone(ErrorMessage = "Format nomor handphone tidak valid")]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Regional wajib diisi")]
        [StringLength(50)]
        public string Regional { get; set; } = string.Empty;

        [Required(ErrorMessage = "Jenis masalah wajib diisi")]
        [StringLength(50)]
        public string IssueType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Aplikasi wajib dipilih")]
        public Guid ApplicationId { get; set; }

        // Relasi ke aplikasi yang bermasalah
        public Application Application { get; set; } = null!;

        [StringLength(100)]
        [Column("CategoryMasalah")]
        public string? Category { get; set; }

        [StringLength(100)]
        [Column("UsernameLDAP")]
        public string? LdapUsername { get; set; }

        [StringLength(100)]
        public string? Role { get; set; }

        [Required(ErrorMessage = "Deskripsi masalah wajib diisi")]
        [StringLength(
            2000,
            ErrorMessage = "Deskripsi maksimal 2000 karakter"
        )]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string Status { get; set; }
            = ComplaintStatuses.Submitted;

        [StringLength(2000)]
        public string? ResolutionNote { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }
    }

    public static class ComplaintStatuses
    {
        public const string Submitted = "Submitted";
        public const string Checking = "Checking";
        public const string Resolved = "Resolved";
        public const string Closed = "Closed";

        public static readonly string[] All =
        {
            Submitted,
            Checking,
            Resolved,
            Closed
        };

        public static bool TryNormalize(
            string? value,
            out string normalized)
        {
            normalized = All.FirstOrDefault(status =>
                string.Equals(
                    status,
                    value?.Trim(),
                    StringComparison.OrdinalIgnoreCase
                )
            ) ?? string.Empty;

            return normalized.Length > 0;
        }
    }
}
