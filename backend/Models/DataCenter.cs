using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DataCenter
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public ICollection<Server> Servers { get; set; }
            = new List<Server>();
    }
}