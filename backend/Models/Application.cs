using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Application
    {
        public Guid Id { get; set; }

        // Server tempat aplikasi berjalan

        [Required]
        public string NamaAplikasi { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string ApplicationUrl { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            "Engineering & Deployment|Budgeting & Finance|Operations|Security|Others",
            ErrorMessage = "Kategori aplikasi tidak valid"
        )]
        public string Category { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            "Active|Inactive|Maintenance",
            ErrorMessage = "Status aplikasi tidak valid"
        )]
        public string Status { get; set; } = string.Empty;

        [Range(typeof(decimal), "0", "100",
            ErrorMessage = "Uptime harus berada antara 0 sampai 100")]
        public decimal? Uptime { get; set; }
        
        [Required]
        public string DataClassification { get; set; } = string.Empty;

        [Required]
        public string DataSource { get; set; } = string.Empty;

        [Required]
        public string DataRetentionPolicy { get; set; } = string.Empty;

        [Required]
        public string Version { get; set; } = string.Empty;

        [Required]
        public string Database { get; set; } = string.Empty;

        [Required]
        public string TechnologyStack { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime? LastUpdated { get; set; }


        // ========================
        // USER RELATIONS
        // ========================

        // Admin/user yang membuat data aplikasi
        public Guid IdPembuat { get; set; }

        // PIC aplikasi, bisa ditentukan nanti
        public Guid? IdPemilik { get; set; }

        // Backup PIC, optional
        public Guid? IdBackupPemilik { get; set; }


        // ========================
        // NAVIGATION
        // ========================

        public ICollection<ApplicationServer> ApplicationServers
            { get; set; } = new List<ApplicationServer>();        

        public User Pembuat { get; set; } = null!;

        public User? Pemilik { get; set; }

        public User? BackupPemilik { get; set; }

        // Relasi baru many-to-many dengan Server

        public ICollection<UserApplicationAccess> UserAccesses
            { get; set; } = new List<UserApplicationAccess>();
        // Semua akun yang diberi akses ke Application ini

        public ICollection<Complaint> Complaints { get; set; }
            = new List<Complaint>();
        public ICollection<User> Users { get; set; }
            = new List<User>();
    }
}