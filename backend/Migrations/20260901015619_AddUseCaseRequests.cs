using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AppHub2.Migrations
{
    /// <inheritdoc />
    public partial class AddUseCaseRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UseCaseRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Pic = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UseCaseName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Objective = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    FeasibilityBenefit = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CustodyPic = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NotaDinasFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    NotaDinasPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BusinessRequirementFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BusinessRequirementPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Submitted"),
                    ReviewNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UseCaseRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UseCaseRequests_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UseCaseRequests_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UseCaseRequests_Users_ReviewedById",
                        column: x => x.ReviewedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "UseCaseRequests",
                columns: new[] { "Id", "ApplicationId", "BusinessRequirementFileName", "BusinessRequirementPath", "CreatedAt", "CreatedById", "CustodyPic", "Description", "FeasibilityBenefit", "NotaDinasFileName", "NotaDinasPath", "Objective", "Pic", "ReviewNote", "ReviewedAt", "ReviewedById", "Status", "UpdatedAt", "UseCaseName" },
                values: new object[,]
                {
                    { new Guid("50000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), null, null, new DateTime(2026, 8, 20, 2, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000002"), "Operations", "Monitoring proses login dan autentikasi pengguna.", "Mengurangi gangguan login dan mempercepat identifikasi masalah autentikasi.", null, null, "Memastikan proses login aplikasi tetap tersedia dan aman.", "PIC App Catalog", "Use case disetujui untuk proses implementasi.", new DateTime(2026, 8, 21, 3, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000001"), "Approved", new DateTime(2026, 8, 21, 3, 0, 0, 0, DateTimeKind.Utc), "Single Sign-On Monitoring" },
                    { new Guid("50000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000002"), null, null, new DateTime(2026, 8, 24, 3, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000003"), "Budgeting & Finance", "Mendeteksi anomali pada penggunaan budget perusahaan.", "Mempercepat proses pemeriksaan transaksi dan penggunaan anggaran.", null, null, "Memberikan peringatan ketika penggunaan budget tidak sesuai perencanaan.", "PIC Finance", null, null, null, "In Review", new DateTime(2026, 8, 25, 4, 0, 0, 0, DateTimeKind.Utc), "Budget Anomaly Detection" },
                    { new Guid("50000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000003"), null, null, new DateTime(2026, 8, 27, 4, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000004"), "Operations", "Memprediksi kemungkinan gangguan jaringan berdasarkan data monitoring.", "Membantu tim melakukan tindakan sebelum gangguan menjadi kritis.", null, null, "Mengurangi risiko downtime pada layanan internal.", "PIC Network", null, null, null, "Submitted", null, "Network Incident Prediction" },
                    { new Guid("50000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000004"), null, null, new DateTime(2026, 8, 28, 5, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000005"), "Security", "Menghubungkan beberapa security alert untuk menemukan pola serangan.", "Mengurangi alert palsu dan membantu proses investigasi.", null, null, "Meningkatkan kemampuan identifikasi insiden keamanan.", "PIC Security", "Sumber data dan ruang lingkup use case belum cukup jelas.", new DateTime(2026, 8, 29, 6, 0, 0, 0, DateTimeKind.Utc), new Guid("10000000-0000-0000-0000-000000000001"), "Rejected", new DateTime(2026, 8, 29, 6, 0, 0, 0, DateTimeKind.Utc), "Security Alert Correlation" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UseCaseRequests_ApplicationId",
                table: "UseCaseRequests",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_UseCaseRequests_CreatedAt",
                table: "UseCaseRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UseCaseRequests_CreatedById",
                table: "UseCaseRequests",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_UseCaseRequests_ReviewedById",
                table: "UseCaseRequests",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_UseCaseRequests_Status",
                table: "UseCaseRequests",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UseCaseRequests");
        }
    }
}
