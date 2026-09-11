using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs
{
    public class CreateUseCaseRequestDto
    {
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

        public IFormFile? NotaDinas { get; set; }

        public IFormFile? BusinessRequirement { get; set; }
    }

    public class UpdateUseCaseRequestDto
    {
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

        public IFormFile? NotaDinas { get; set; }

        public IFormFile? BusinessRequirement { get; set; }
    }

    public class UpdateUseCaseStatusDto
    {
        [Required]
        [RegularExpression(
            "^(Submitted|In Review|Approved|Rejected)$",
            ErrorMessage = "Status use case tidak valid"
        )]
        public string Status { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? ReviewNote { get; set; }
    }

    public class UseCaseRequestResponseDto
    {
        public Guid Id { get; set; }

        public Guid ApplicationId { get; set; }

        public string ApplicationName { get; set; } = string.Empty;

        public string Pic { get; set; } = string.Empty;

        public string UseCaseName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Objective { get; set; } = string.Empty;

        public string FeasibilityBenefit { get; set; } = string.Empty;

        public string CustodyPic { get; set; } = string.Empty;

        public string? NotaDinasFileName { get; set; }

        public string? NotaDinasDownloadUrl { get; set; }

        public string? BusinessRequirementFileName { get; set; }

        public string? BusinessRequirementDownloadUrl { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ReviewNote { get; set; }

        public Guid CreatedById { get; set; }

        public string CreatedByName { get; set; } = string.Empty;

        public Guid? ReviewedById { get; set; }

        public string? ReviewedByName { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }
    }
}