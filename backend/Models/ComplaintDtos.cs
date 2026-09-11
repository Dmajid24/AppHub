using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class CreateComplaintRequest
    {
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

        [StringLength(100)]
        public string? Category { get; set; }

        [StringLength(100)]
        public string? LdapUsername { get; set; }

        [StringLength(100)]
        public string? Role { get; set; }

        [Required(ErrorMessage = "Deskripsi masalah wajib diisi")]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateComplaintRequest
        : CreateComplaintRequest
    {
    }

    public class UpdateComplaintStatusRequest
    {
        [Required(ErrorMessage = "Status wajib diisi")]
        public string Status { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? ResolutionNote { get; set; }
    }

    public class ComplaintResponse
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Regional { get; set; } = string.Empty;

        public string IssueType { get; set; } = string.Empty;

        public Guid ApplicationId { get; set; }

        public string ApplicationName { get; set; }
            = string.Empty;

        public string? Category { get; set; }

        public string? LdapUsername { get; set; }

        public string? Role { get; set; }

        public string Description { get; set; }
            = string.Empty;

        public string Status { get; set; }
            = string.Empty;

        public string? ResolutionNote { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }
    }
}