using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AppHub2.Migrations
{
    /// <inheritdoc />
    public partial class AddDataCentersAndApplicationServers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Servers_ServerId",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_ServerId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "ServerId",
                table: "Applications");

            migrationBuilder.AlterColumn<string>(
                name: "ServerName",
                table: "Servers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "IpAddress",
                table: "Servers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "AlertLevel",
                table: "Servers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CpuCore",
                table: "Servers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "DataCenterId",
                table: "Servers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "DeviceType",
                table: "Servers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeviceTypeName",
                table: "Servers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "DiskGB",
                table: "Servers",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Environment",
                table: "Servers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Hostname",
                table: "Servers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Servers",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Servers",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "MemoryGB",
                table: "Servers",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "OperatingSystem",
                table: "Servers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Rack",
                table: "Servers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ApplicationServers",
                columns: table => new
                {
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantAplikasi = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Function = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationServers", x => new { x.ApplicationId, x.ServerId });
                    table.ForeignKey(
                        name: "FK_ApplicationServers_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationServers_Servers_ServerId",
                        column: x => x.ServerId,
                        principalTable: "Servers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DataCenters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataCenters", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ApplicationServers",
                columns: new[] { "ApplicationId", "ServerId", "Function", "TenantAplikasi" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), new Guid("30000000-0000-0000-0000-000000000001"), "Web Server", "App Catalog Production" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), new Guid("30000000-0000-0000-0000-000000000002"), "Application Server", "Finance Production" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), new Guid("30000000-0000-0000-0000-000000000003"), "Monitoring Server", "Network Production" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), new Guid("30000000-0000-0000-0000-000000000003"), "Security Processor", "Security Production" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), new Guid("30000000-0000-0000-0000-000000000001"), "Application Server", "Deployment Production" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), new Guid("30000000-0000-0000-0000-000000000002"), "Application Server", "Inventory Production" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), new Guid("30000000-0000-0000-0000-000000000002"), "Application Server", "Budget Staging" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new Guid("30000000-0000-0000-0000-000000000001"), "Web Server", "Employee Production" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new Guid("30000000-0000-0000-0000-000000000001"), "Gateway Service", "Gateway Production" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), new Guid("30000000-0000-0000-0000-000000000003"), "Log Processor", "Logging Staging" }
                });

            migrationBuilder.InsertData(
                table: "DataCenters",
                columns: new[] { "Id", "Address", "City", "Latitude", "Longitude", "Name" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-0000-0000-000000000001"), "Lokasi demo Jakarta pusat", "Jakarta", -6.2088000000000001, 106.8456, "Jakarta Central DC Demo" },
                    { new Guid("40000000-0000-0000-0000-000000000002"), "Lokasi demo Surabaya", "Surabaya", -7.2575000000000003, 112.7521, "Surabaya DC Demo" },
                    { new Guid("40000000-0000-0000-0000-000000000003"), "Lokasi demo Jakarta selatan", "Jakarta", -6.2892000000000001, 106.8006, "Jakarta South DC Demo" },
                    { new Guid("40000000-0000-0000-0000-000000000004"), "Lokasi demo Medan", "Medan", 3.5952000000000002, 98.672200000000004, "Medan DC Demo" },
                    { new Guid("40000000-0000-0000-0000-000000000005"), "Lokasi demo Makassar", "Makassar", -5.1477000000000004, 119.4327, "Makassar DC Demo" },
                    { new Guid("40000000-0000-0000-0000-000000000006"), "Lokasi demo Balikpapan", "Balikpapan", -1.2379, 116.85290000000001, "Balikpapan DC Demo" }
                });

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"),
                columns: new[] { "CpuCore", "DataCenterId", "Description", "DeviceType", "DeviceTypeName", "DiskGB", "Environment", "Hostname", "IpAddress", "LastChecked", "Latitude", "Longitude", "MemoryGB", "OperatingSystem", "Rack", "ServerName" },
                values: new object[] { 8, new Guid("40000000-0000-0000-0000-000000000001"), "Server dummy jkt-prod-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, "Production", "jkt-prod-01", "10.10.1.11", new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, "Ubuntu Server 24.04 LTS", "R01-U01", "jkt-prod-01" });

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"),
                columns: new[] { "CpuCore", "DataCenterId", "Description", "DeviceType", "DeviceTypeName", "DiskGB", "Environment", "Hostname", "IpAddress", "LastChecked", "Latitude", "Longitude", "MemoryGB", "OperatingSystem", "Rack", "ServerName" },
                values: new object[] { 16, new Guid("40000000-0000-0000-0000-000000000001"), "Server dummy jkt-fin-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 1000.0, "Production", "jkt-fin-01", "10.10.1.12", new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, "Windows Server 2025", "R01-U02", "jkt-fin-01" });

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"),
                columns: new[] { "CpuCore", "DataCenterId", "Description", "DeviceType", "DeviceTypeName", "DiskGB", "Environment", "Hostname", "IpAddress", "LastChecked", "Latitude", "Longitude", "MemoryGB", "OperatingSystem", "Rack", "ServerName" },
                values: new object[] { 16, new Guid("40000000-0000-0000-0000-000000000002"), "Server dummy sby-sec-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 1000.0, "Production", "sby-sec-01", "10.20.1.11", new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, "Ubuntu Server 24.04 LTS", "R01-U03", "sby-sec-01" });

            migrationBuilder.InsertData(
                table: "Servers",
                columns: new[] { "Id", "AlertLevel", "Availability", "CpuCore", "CpuUsage", "DataCenterId", "Description", "DeviceType", "DeviceTypeName", "DiskGB", "DiskUsage", "Environment", "Hostname", "IpAddress", "IsCritical", "LastChecked", "Latitude", "Longitude", "MemoryGB", "MemoryUsage", "OperatingSystem", "Rack", "Region", "ResponseTimeMs", "ServerName", "Status" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000004"), "Info", 99.980000000000004, 16, 41.0, new Guid("40000000-0000-0000-0000-000000000001"), "Server dummy jkt-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 2000.0, 62.0, "Production", "jkt-db-01", "10.10.1.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 58.0, "Ubuntu Server 24.04 LTS", "R01-U04", "Jakarta", 65, "jkt-db-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000005"), "Info", 99.989999999999995, 8, 24.0, new Guid("40000000-0000-0000-0000-000000000003"), "Server dummy jks-web-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 250.0, 42.0, "Production", "jks-web-01", "10.10.2.11", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 16.0, 39.0, "Ubuntu Server 24.04 LTS", "R01-U05", "Jakarta", 45, "jks-web-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000006"), "Info", 99.969999999999999, 8, 46.0, new Guid("40000000-0000-0000-0000-000000000003"), "Server dummy jks-api-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 35.0, "Production", "jks-api-01", "10.10.2.12", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 51.0, "Ubuntu Server 24.04 LTS", "R01-U06", "Jakarta", 74, "jks-api-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000007"), "Info", 99.989999999999995, 16, 38.0, new Guid("40000000-0000-0000-0000-000000000003"), "Server dummy jks-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 2000.0, 57.0, "Production", "jks-db-01", "10.10.2.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 62.0, "Ubuntu Server 24.04 LTS", "R01-U07", "Jakarta", 52, "jks-db-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000008"), "Info", 99.950000000000003, 8, 36.0, new Guid("40000000-0000-0000-0000-000000000002"), "Server dummy sby-web-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 52.0, "Production", "sby-web-01", "10.20.1.12", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 47.0, "Ubuntu Server 24.04 LTS", "R01-U08", "Surabaya", 90, "sby-web-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000009"), "Warning", 99.099999999999994, 16, 67.0, new Guid("40000000-0000-0000-0000-000000000002"), "Server dummy sby-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 2000.0, 79.0, "Production", "sby-db-01", "10.20.1.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 82.0, "Ubuntu Server 24.04 LTS", "R01-U09", "Surabaya", 260, "sby-db-01", "Warning" },
                    { new Guid("30000000-0000-0000-0000-000000000010"), "Info", 99.959999999999994, 4, 28.0, new Guid("40000000-0000-0000-0000-000000000004"), "Server dummy mdn-web-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 250.0, 38.0, "Production", "mdn-web-01", "10.30.1.11", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 16.0, 42.0, "Ubuntu Server 24.04 LTS", "R01-U10", "Medan", 95, "mdn-web-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000011"), "Info", 99.930000000000007, 8, 44.0, new Guid("40000000-0000-0000-0000-000000000004"), "Server dummy mdn-api-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 49.0, "Production", "mdn-api-01", "10.30.1.12", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 56.0, "Ubuntu Server 24.04 LTS", "R01-U11", "Medan", 110, "mdn-api-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000012"), "Info", 99.980000000000004, 16, 39.0, new Guid("40000000-0000-0000-0000-000000000004"), "Server dummy mdn-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 1000.0, 63.0, "Production", "mdn-db-01", "10.30.1.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 61.0, "Ubuntu Server 24.04 LTS", "R01-U12", "Medan", 70, "mdn-db-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000013"), "Info", 99.939999999999998, 8, 35.0, new Guid("40000000-0000-0000-0000-000000000005"), "Server dummy mks-web-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 41.0, "Production", "mks-web-01", "10.40.1.11", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 46.0, "Ubuntu Server 24.04 LTS", "R01-U13", "Makassar", 120, "mks-web-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000014"), "Warning", 98.900000000000006, 8, 84.0, new Guid("40000000-0000-0000-0000-000000000005"), "Server dummy mks-api-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 64.0, "Production", "mks-api-01", "10.40.1.12", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 76.0, "Ubuntu Server 24.04 LTS", "R01-U14", "Makassar", 340, "mks-api-01", "Warning" },
                    { new Guid("30000000-0000-0000-0000-000000000015"), "Info", 99.959999999999994, 16, 48.0, new Guid("40000000-0000-0000-0000-000000000005"), "Server dummy mks-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 1000.0, 66.0, "Production", "mks-db-01", "10.40.1.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 59.0, "Ubuntu Server 24.04 LTS", "R01-U15", "Makassar", 85, "mks-db-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000016"), "Info", 99.900000000000006, 8, 31.0, new Guid("40000000-0000-0000-0000-000000000006"), "Server dummy bpn-web-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 500.0, 48.0, "Production", "bpn-web-01", "10.50.1.11", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 43.0, "Ubuntu Server 24.04 LTS", "R01-U16", "Balikpapan", 130, "bpn-web-01", "Online" },
                    { new Guid("30000000-0000-0000-0000-000000000017"), "Critical", 95.799999999999997, 16, 87.0, new Guid("40000000-0000-0000-0000-000000000006"), "Server dummy bpn-db-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 2000.0, 96.0, "Production", "bpn-db-01", "10.50.1.12", true, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 64.0, 93.0, "Ubuntu Server 24.04 LTS", "R01-U17", "Balikpapan", 920, "bpn-db-01", "Critical" },
                    { new Guid("30000000-0000-0000-0000-000000000018"), "Info", 98.200000000000003, 8, 12.0, new Guid("40000000-0000-0000-0000-000000000006"), "Server dummy bpn-dr-01 untuk demo Map dan Tech Info.", "Virtual Machine", "VMware Virtual Machine", 1000.0, 44.0, "Disaster Recovery", "bpn-dr-01", "10.50.1.13", false, new DateTime(2026, 9, 8, 3, 0, 0, 0, DateTimeKind.Utc), 0.0, 0.0, 32.0, 25.0, "Ubuntu Server 24.04 LTS", "R01-U18", "Balikpapan", 180, "bpn-dr-01", "Maintenance" }
                });

            migrationBuilder.InsertData(
                table: "ApplicationServers",
                columns: new[] { "ApplicationId", "ServerId", "Function", "TenantAplikasi" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), new Guid("30000000-0000-0000-0000-000000000004"), "Database", "App Catalog Production" },
                    { new Guid("20000000-0000-0000-0000-000000000001"), new Guid("30000000-0000-0000-0000-000000000005"), "Web Replica", "App Catalog Production" },
                    { new Guid("20000000-0000-0000-0000-000000000001"), new Guid("30000000-0000-0000-0000-000000000010"), "Web Server", "App Catalog Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), new Guid("30000000-0000-0000-0000-000000000004"), "Database", "Finance Production" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), new Guid("30000000-0000-0000-0000-000000000008"), "Application Replica", "Finance Recovery" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), new Guid("30000000-0000-0000-0000-000000000018"), "Disaster Recovery", "Finance Recovery" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), new Guid("30000000-0000-0000-0000-000000000006"), "Monitoring API", "Network Production" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), new Guid("30000000-0000-0000-0000-000000000011"), "Regional Collector", "Network Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), new Guid("30000000-0000-0000-0000-000000000014"), "Regional Collector", "Network Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), new Guid("30000000-0000-0000-0000-000000000005"), "Dashboard", "Security Production" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), new Guid("30000000-0000-0000-0000-000000000009"), "Event Database", "Security Production" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), new Guid("30000000-0000-0000-0000-000000000017"), "Event Database", "Security Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), new Guid("30000000-0000-0000-0000-000000000006"), "Deployment API", "Deployment Production" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), new Guid("30000000-0000-0000-0000-000000000007"), "Database", "Deployment Production" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), new Guid("30000000-0000-0000-0000-000000000012"), "Database", "Inventory Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), new Guid("30000000-0000-0000-0000-000000000013"), "Web Server", "Inventory Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), new Guid("30000000-0000-0000-0000-000000000015"), "Database", "Inventory Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), new Guid("30000000-0000-0000-0000-000000000004"), "Database", "Budget Staging" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), new Guid("30000000-0000-0000-0000-000000000018"), "Disaster Recovery", "Budget Recovery" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new Guid("30000000-0000-0000-0000-000000000007"), "Database", "Employee Production" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new Guid("30000000-0000-0000-0000-000000000010"), "Web Server", "Employee Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new Guid("30000000-0000-0000-0000-000000000013"), "Web Server", "Employee Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new Guid("30000000-0000-0000-0000-000000000016"), "Web Server", "Employee Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new Guid("30000000-0000-0000-0000-000000000006"), "Gateway Replica", "Gateway Production" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new Guid("30000000-0000-0000-0000-000000000011"), "Regional Gateway", "Gateway Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new Guid("30000000-0000-0000-0000-000000000014"), "Regional Gateway", "Gateway Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new Guid("30000000-0000-0000-0000-000000000016"), "Regional Gateway", "Gateway Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), new Guid("30000000-0000-0000-0000-000000000009"), "Log Storage", "Logging Staging" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), new Guid("30000000-0000-0000-0000-000000000012"), "Log Storage", "Logging Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), new Guid("30000000-0000-0000-0000-000000000015"), "Log Storage", "Logging Regional" },
                    { new Guid("20000000-0000-0000-0000-000000000010"), new Guid("30000000-0000-0000-0000-000000000017"), "Log Storage", "Logging Regional" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Servers_DataCenterId",
                table: "Servers",
                column: "DataCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Servers_Hostname",
                table: "Servers",
                column: "Hostname",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Servers_IpAddress",
                table: "Servers",
                column: "IpAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationServers_ServerId",
                table: "ApplicationServers",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_DataCenters_Name",
                table: "DataCenters",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Servers_DataCenters_DataCenterId",
                table: "Servers",
                column: "DataCenterId",
                principalTable: "DataCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servers_DataCenters_DataCenterId",
                table: "Servers");

            migrationBuilder.DropTable(
                name: "ApplicationServers");

            migrationBuilder.DropTable(
                name: "DataCenters");

            migrationBuilder.DropIndex(
                name: "IX_Servers_DataCenterId",
                table: "Servers");

            migrationBuilder.DropIndex(
                name: "IX_Servers_Hostname",
                table: "Servers");

            migrationBuilder.DropIndex(
                name: "IX_Servers_IpAddress",
                table: "Servers");

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000018"));

            migrationBuilder.DropColumn(
                name: "CpuCore",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "DataCenterId",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "DeviceType",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "DeviceTypeName",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "DiskGB",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Environment",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Hostname",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "MemoryGB",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "OperatingSystem",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "Rack",
                table: "Servers");

            migrationBuilder.AlterColumn<string>(
                name: "ServerName",
                table: "Servers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "IpAddress",
                table: "Servers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "AlertLevel",
                table: "Servers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ServerId",
                table: "Applications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000003"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000003"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000009"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.UpdateData(
                table: "Applications",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000010"),
                column: "ServerId",
                value: new Guid("30000000-0000-0000-0000-000000000003"));

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"),
                columns: new[] { "Description", "IpAddress", "LastChecked", "ServerName" },
                values: new object[] { "Main production server untuk aplikasi internal", "192.168.1.10", new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), "Production Server Jakarta" });

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"),
                columns: new[] { "Description", "IpAddress", "LastChecked", "ServerName" },
                values: new object[] { "Server untuk aplikasi finance dan operation", "192.168.1.20", new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), "Finance & Operation Server" });

            migrationBuilder.UpdateData(
                table: "Servers",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"),
                columns: new[] { "Description", "IpAddress", "LastChecked", "ServerName" },
                values: new object[] { "Server network dan security dengan resource tinggi", "192.168.1.30", new DateTime(2026, 8, 20, 8, 0, 0, 0, DateTimeKind.Utc), "Security & Network Server" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ServerId",
                table: "Applications",
                column: "ServerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Servers_ServerId",
                table: "Applications",
                column: "ServerId",
                principalTable: "Servers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
