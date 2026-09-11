using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Server
    {
        public Guid Id { get; set; }

        // =============================================
        // DATA CENTER
        // =============================================

        public Guid DataCenterId { get; set; }

        public DataCenter DataCenter { get; set; } = null!;


        // =============================================
        // IDENTITAS SERVER / DEVICE
        // =============================================

        [Required]
        [MaxLength(150)]
        public string ServerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Hostname { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DeviceType { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string DeviceTypeName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string OperatingSystem { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Environment { get; set; } = "Production";

        [MaxLength(50)]
        public string? Rack { get; set; }


        // =============================================
        // KAPASITAS SERVER
        // Ditampilkan pada tabel Tech Info
        // =============================================

        public int CpuCore { get; set; }

        public double MemoryGB { get; set; }

        public double DiskGB { get; set; }


        // =============================================
        // KESEHATAN SERVER
        // Digunakan untuk Server Health Map
        // Nilainya dalam persen
        // =============================================

        [Required]
        [RegularExpression(
            "Online|Warning|Critical|Offline|Maintenance",
            ErrorMessage = "Status server tidak valid"
        )]
        public string Status { get; set; } = "Online";

        [Range(0, 100)]
        public double CpuUsage { get; set; }

        [Range(0, 100)]
        public double MemoryUsage { get; set; }

        [Range(0, 100)]
        public double DiskUsage { get; set; }

        [Range(0, 100)]
        public double Availability { get; set; }

        public int ResponseTimeMs { get; set; }

        public bool IsCritical { get; set; }

        public DateTime LastChecked { get; set; }

        [MaxLength(50)]
        public string? AlertLevel { get; set; }

        public string? Description { get; set; }


        // =============================================
        // FIELD LAMA — SEMENTARA DIPERTAHANKAN
        //
        // Koordinat nantinya dipindahkan ke DataCenter.
        // Region nantinya diambil dari DataCenter.City.
        // Jangan dihapus sekarang karena masih digunakan
        // oleh seeder dan migration lama.
        // =============================================

        [Required]
        public string Region { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }


        // =============================================
        // RELASI BARU MANY-TO-MANY
        // =============================================

        public ICollection<ApplicationServer> ApplicationServers
            { get; set; } = new List<ApplicationServer>();


        // =============================================
        // RELASI LAMA — SEMENTARA DIPERTAHANKAN
        //
        // Akan dihapus setelah seeder dan Application.cs
        // sudah dipindahkan ke relasi many-to-many.
        // =============================================

    }
}