using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class UseCaseRequest
    {
        public Guid Id { get; set; }

        [Required]
        public Guid ApplicationId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Pic { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string UseCaseName { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Objective { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string FeasibilityBenefit { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CustodyPic { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? NotaDinasFileName { get; set; }

        [MaxLength(500)]
        public string? NotaDinasPath { get; set; }

        [MaxLength(255)]
        public string? BusinessRequirementFileName { get; set; }

        [MaxLength(500)]
        public string? BusinessRequirementPath { get; set; }

        [Required]
        [MaxLength(30)]
        [RegularExpression(
            "^(Submitted|In Review|Approved|Rejected)$",
            ErrorMessage = "Status use case tidak valid"
        )]
        public string Status { get; set; } = "Submitted";

        [MaxLength(2000)]
        public string? ReviewNote { get; set; }

        public Guid CreatedById { get; set; }

        public Guid? ReviewedById { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public Application Application { get; set; } = null!;

        public User CreatedBy { get; set; } = null!;

        public User? ReviewedBy { get; set; }
    }
}