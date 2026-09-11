using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AppHub2.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Servers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerName = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    Region = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CpuUsage = table.Column<double>(type: "double precision", nullable: false),
                    MemoryUsage = table.Column<double>(type: "double precision", nullable: false),
                    DiskUsage = table.Column<double>(type: "double precision", nullable: false),
                    Availability = table.Column<double>(type: "double precision", nullable: false),
                    ResponseTimeMs = table.Column<int>(type: "integer", nullable: false),
                    IsCritical = table.Column<bool>(type: "boolean", nullable: false),
                    LastChecked = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AlertLevel = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerId = table.Column<Guid>(type: "uuid", nullable: false),
                    NamaAplikasi = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ApplicationUrl = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DataClassification = table.Column<string>(type: "text", nullable: false),
                    DataSource = table.Column<string>(type: "text", nullable: false),
                    DataRetentionPolicy = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: false),
                    Database = table.Column<string>(type: "text", nullable: false),
                    TechnologyStack = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IdPembuat = table.Column<Guid>(type: "uuid", nullable: false),
                    IdPemilik = table.Column<Guid>(type: "uuid", nullable: true),
                    IdBackupPemilik = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Servers_ServerId",
                        column: x => x.ServerId,
                        principalTable: "Servers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Complaints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Regional = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IssueType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryMasalah = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UsernameLDAP = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Complaints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Complaints_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    NIK = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Nama = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LevelAccess = table.Column<string>(type: "text", nullable: false),
                    Telp = table.Column<string>(type: "text", nullable: true),
                    Department = table.Column<string>(type: "text", nullable: false),
                    AlasanPengajuan = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Servers",
                columns: new[] { "Id", "AlertLevel", "Availability", "CpuUsage", "Description", "DiskUsage", "IpAddress", "IsCritical", "LastChecked", "MemoryUsage", "Region", "ResponseTimeMs", "ServerName", "Status" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), "Info", 99.900000000000006, 32.0, "Main production server untuk aplikasi internal", 55.0, "192.168.1.10", false, new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), 48.0, "Jakarta", 85, "Production Server Jakarta", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000002"), "Warning", 98.700000000000003, 72.0, "Server untuk aplikasi finance dan operation", 68.0, "192.168.1.20", false, new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), 78.0, "Jakarta", 230, "Finance & Operation Server", "Warning" },
                    { new Guid("30000000-0000-0000-0000-000000000003"), "Critical", 94.5, 94.0, "Server network dan security dengan resource tinggi", 84.0, "192.168.1.30", true, new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), 91.0, "Surabaya", 760, "Security & Network Server", "Critical" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AlasanPengajuan", "ApplicationId", "Department", "Email", "LevelAccess", "NIK", "Nama", "Password", "Telp", "Username" },
                values: new object[] { new Guid("10000000-0000-0000-0000-000000000001"), "Administrator aplikasi monitoring internal", null, "IT", "admin@example.com", "Admin", "1234567890", "Administrator", "admin123", "081234567890", "admin" });

            migrationBuilder.InsertData(
                table: "Applications",
                columns: new[] { "Id", "ApplicationUrl", "Category", "CreatedAt", "DataClassification", "DataRetentionPolicy", "DataSource", "Database", "Description", "IdBackupPemilik", "IdPembuat", "IdPemilik", "LastUpdated", "NamaAplikasi", "ServerId", "Status", "TechnologyStack", "Version" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "https://appcatalog.internal", "Operations", new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "5 Years", "Internal Application Database", "PostgreSQL", "Portal katalog dan akses aplikasi internal perusahaan.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 1, 0, 0, 0, 0, DateTimeKind.Utc), "App Catalog SSO", new Guid("30000000-0000-0000-0000-000000000001"), "Active", ".NET, React, PostgreSQL", "2.5.0" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "https://finance.internal", "Budgeting & Finance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Confidential", "7 Years", "Finance Database", "PostgreSQL", "Aplikasi internal untuk pengelolaan keuangan dan budgeting.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 7, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Finance Management System", new Guid("30000000-0000-0000-0000-000000000002"), "Active", ".NET, Angular, PostgreSQL", "3.2.1" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "https://network-monitor.internal", "Operations", new DateTime(2026, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "1 Year", "Network Monitoring API", "PostgreSQL", "Monitoring kondisi jaringan dan layanan internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Network Monitoring", new Guid("30000000-0000-0000-0000-000000000003"), "Active", ".NET, React, Prometheus", "4.1.0" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "https://security.internal", "Security", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Restricted", "3 Years", "Security Event Logs", "PostgreSQL", "Dashboard monitoring event dan security internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Security Dashboard", new Guid("30000000-0000-0000-0000-000000000003"), "Active", ".NET, React, Elasticsearch", "2.8.0" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "https://deployment.internal", "Engineering & Deployment", new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "1 Year", "CI/CD Platform", "PostgreSQL", "Aplikasi internal untuk pengelolaan deployment.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 7, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Deployment Manager", new Guid("30000000-0000-0000-0000-000000000001"), "Active", ".NET, Vue, PostgreSQL", "1.9.4" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), "https://inventory.internal", "Operations", new DateTime(2026, 3, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "3 Years", "Inventory Database", "MySQL", "Aplikasi pengelolaan inventory internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 6, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Inventory System", new Guid("30000000-0000-0000-0000-000000000002"), "Inactive", "Laravel, MySQL, Bootstrap", "1.4.2" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), "https://budget.internal", "Budgeting & Finance", new DateTime(2026, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Confidential", "7 Years", "Finance Database", "PostgreSQL", "Perencanaan dan monitoring budget internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), null, "Budget Planning", new Guid("30000000-0000-0000-0000-000000000002"), "Pending", ".NET, React, PostgreSQL", "1.0.0" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), "https://employee.internal", "Others", new DateTime(2026, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "5 Years", "Employee Database", "PostgreSQL", "Portal layanan internal untuk employee.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Employee Portal", new Guid("30000000-0000-0000-0000-000000000001"), "Active", ".NET, React, PostgreSQL", "3.0.5" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), "https://gateway.internal", "Engineering & Deployment", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Internal", "1 Year", "Internal APIs", "PostgreSQL", "Gateway untuk integrasi berbagai API internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 8, 12, 0, 0, 0, 0, DateTimeKind.Utc), "API Gateway", new Guid("30000000-0000-0000-0000-000000000001"), "Active", ".NET, Redis, PostgreSQL", "5.3.0" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), "https://logs.internal", "Security", new DateTime(2026, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Restricted", "2 Years", "Application Logs", "Elasticsearch", "Centralized log management untuk aplikasi internal.", new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001"), null, "Log Management", new Guid("30000000-0000-0000-0000-000000000003"), "Pending", ".NET, Elasticsearch, Kibana", "1.1.0" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AlasanPengajuan", "ApplicationId", "Department", "Email", "LevelAccess", "NIK", "Nama", "Password", "Telp", "Username" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Akses monitoring Finance Management System", new Guid("20000000-0000-0000-0000-000000000002"), "Finance", "budi@example.com", "Read Only", "1234567891", "Budi Santoso", "user123", "081234567891", "budi" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Akses pengelolaan App Catalog SSO", new Guid("20000000-0000-0000-0000-000000000001"), "Human Resource", "siti@example.com", "Read And Write", "1234567892", "Siti Rahma", "user123", "081234567892", "siti" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Akses monitoring Network Monitoring", new Guid("20000000-0000-0000-0000-000000000003"), "Network", "andika@example.com", "Read And Write", "1234567893", "Andika Putra", "user123", "081234567893", "andika" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Akses monitoring Security Dashboard", new Guid("20000000-0000-0000-0000-000000000004"), "Security", "rina@example.com", "Read Only", "1234567894", "Rina Wijaya", "user123", "081234567894", "rina" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_IdBackupPemilik",
                table: "Applications",
                column: "IdBackupPemilik");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_IdPembuat",
                table: "Applications",
                column: "IdPembuat");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_IdPemilik",
                table: "Applications",
                column: "IdPemilik");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ServerId",
                table: "Applications",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_ApplicationId",
                table: "Complaints",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ApplicationId",
                table: "Users",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_IdBackupPemilik",
                table: "Applications",
                column: "IdBackupPemilik",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_IdPembuat",
                table: "Applications",
                column: "IdPembuat",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_IdPemilik",
                table: "Applications",
                column: "IdPemilik",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Servers_ServerId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_IdBackupPemilik",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_IdPembuat",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_IdPemilik",
                table: "Applications");

            migrationBuilder.DropTable(
                name: "Complaints");

            migrationBuilder.DropTable(
                name: "Servers");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Applications");
        }
    }
}
