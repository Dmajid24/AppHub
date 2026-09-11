using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ApplicationServer
    {
        public Guid ApplicationId { get; set; }

        public Guid ServerId { get; set; }

        [Required]
        [MaxLength(150)]
        public string TenantAplikasi { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Function { get; set; } = string.Empty;

        public Application Application { get; set; } = null!;

        public Server Server { get; set; } = null!;
    }
}