namespace backend.Models
{
    public class UserApplicationAccess
    {
        public Guid UserId { get; set; }

        public Guid ApplicationId { get; set; }

        public string AccessLevel { get; set; } = "Read Only";

        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        public Guid? GrantedBy { get; set; }

        public bool IsActive { get; set; } = true;

        public User User { get; set; } = null!;

        public Application Application { get; set; } = null!;
    }
}