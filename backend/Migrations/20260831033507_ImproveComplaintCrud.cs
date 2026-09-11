using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AppHub2.Migrations
{
    /// <inheritdoc />
    public partial class ImproveComplaintCrud : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Complaints_Applications_ApplicationId",
                table: "Complaints");

            migrationBuilder.AlterColumn<string>(
                name: "UsernameLDAP",
                table: "Complaints",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Complaints",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Complaints",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "CategoryMasalah",
                table: "Complaints",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Complaints",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Complaints",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Complaints",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResolutionNote",
                table: "Complaints",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Complaints",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Complaints",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Submitted");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Complaints",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Complaints",
                columns: new[] { "Id", "ApplicationId", "CategoryMasalah", "CreatedAt", "Description", "Email", "FullName", "IssueType", "UsernameLDAP", "Phone", "Regional", "ResolutionNote", "ResolvedAt", "Role", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), "Reviewer User", new DateTime(2026, 8, 21, 2, 0, 0, 0, DateTimeKind.Utc), "User tidak dapat membuka menu reviewer pada aplikasi.", "budi@example.com", "Budi Santoso", "User Management", "budi", "081234567891", "HQ", "Akses reviewer telah ditambahkan oleh administrator.", new DateTime(2026, 8, 21, 5, 30, 0, 0, DateTimeKind.Utc), "Read Only", "Resolved", new DateTime(2026, 8, 21, 5, 30, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000001"), "Reviewer User", new DateTime(2026, 8, 22, 3, 15, 0, 0, DateTimeKind.Utc), "Role pengguna tidak sesuai dengan jabatan yang dimiliki.", "siti@example.com", "Siti Rahma", "User Management", "siti", "081234567892", "RI SUMBAGUT", "Sedang dilakukan pengecekan role dan department pengguna.", null, "Read And Write", "Checking", new DateTime(2026, 8, 22, 6, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000002"), "Data Not Synchronize", new DateTime(2026, 8, 23, 1, 45, 0, 0, DateTimeKind.Utc), "Data transaksi terbaru belum muncul pada dashboard finance.", "rina@example.com", "Rina Wijaya", "Data Not Synchronize", null, "081234567894", "HQ", "Tim sedang memeriksa proses sinkronisasi database.", null, null, "Checking", new DateTime(2026, 8, 23, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000002"), "KPI", new DateTime(2026, 8, 24, 2, 30, 0, 0, DateTimeKind.Utc), "Halaman KPI membutuhkan waktu cukup lama untuk ditampilkan.", "admin@example.com", "Administrator", "Performance", null, "081234567890", "HQ", null, null, null, "Submitted", null },
                    { new Guid("40000000-0000-0000-0000-000000000005"), new Guid("20000000-0000-0000-0000-000000000003"), "RH Visit", new DateTime(2026, 8, 25, 1, 0, 0, 0, DateTimeKind.Utc), "Dashboard network monitoring sering mengalami loading lama.", "andika@example.com", "Andika Putra", "Performance", null, "081234567893", "R4 WEST JAVA", null, null, null, "Submitted", null },
                    { new Guid("40000000-0000-0000-0000-000000000006"), new Guid("20000000-0000-0000-0000-000000000003"), "Ticketing Handling", new DateTime(2026, 8, 25, 4, 0, 0, 0, DateTimeKind.Utc), "Tombol pembuatan ticket tidak merespons ketika diklik.", "andika@example.com", "Andika Putra", "Aplication Error", null, "081234567893", "R6 EAST JAVA", "Masalah pada endpoint ticketing telah diperbaiki.", new DateTime(2026, 8, 26, 2, 0, 0, 0, DateTimeKind.Utc), null, "Resolved", new DateTime(2026, 8, 26, 2, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000007"), new Guid("20000000-0000-0000-0000-000000000004"), "Ticketing Handling", new DateTime(2026, 8, 26, 3, 0, 0, 0, DateTimeKind.Utc), "Notifikasi security alert tidak dapat dibuka.", "rina@example.com", "Rina Wijaya", "Aplication Error", null, "081234567894", "HQ", "Complaint ditutup setelah perbaikan dan konfirmasi pengguna.", new DateTime(2026, 8, 27, 2, 0, 0, 0, DateTimeKind.Utc), null, "Closed", new DateTime(2026, 8, 27, 2, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000008"), new Guid("20000000-0000-0000-0000-000000000005"), "Data Not Synchronize", new DateTime(2026, 8, 27, 5, 0, 0, 0, DateTimeKind.Utc), "Riwayat deployment terbaru belum tampil pada dashboard.", "budi@example.com", "Budi Santoso", "Data Not Synchronize", null, "081234567891", "R4 WEST JAVA", "Sedang dilakukan pengecekan deployment service.", null, null, "Checking", new DateTime(2026, 8, 28, 1, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000009"), new Guid("20000000-0000-0000-0000-000000000006"), "Data Not Synchronize", new DateTime(2026, 8, 28, 3, 0, 0, 0, DateTimeKind.Utc), "Jumlah stok pada dashboard berbeda dengan database.", "siti@example.com", "Siti Rahma", "Data Not Synchronize", null, "081234567892", "R6 EAST JAVA", "Proses sinkronisasi stok telah dijalankan ulang.", new DateTime(2026, 8, 29, 2, 0, 0, 0, DateTimeKind.Utc), null, "Resolved", new DateTime(2026, 8, 29, 2, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("40000000-0000-0000-0000-000000000010"), new Guid("20000000-0000-0000-0000-000000000007"), "KPI", new DateTime(2026, 8, 29, 4, 30, 0, 0, DateTimeKind.Utc), "Proses menampilkan laporan anggaran berjalan lambat.", "admin@example.com", "Administrator", "Performance", null, "081234567890", "HQ", null, null, null, "Submitted", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_CreatedAt",
                table: "Complaints",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_Status",
                table: "Complaints",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Complaints_Applications_ApplicationId",
                table: "Complaints",
                column: "ApplicationId",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Complaints_Applications_ApplicationId",
                table: "Complaints");

            migrationBuilder.DropIndex(
                name: "IX_Complaints_CreatedAt",
                table: "Complaints");

            migrationBuilder.DropIndex(
                name: "IX_Complaints_Status",
                table: "Complaints");

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Complaints",
                keyColumn: "Id",
                keyValue: new Guid("40000000-0000-0000-0000-000000000010"));

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "ResolutionNote",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Complaints");

            migrationBuilder.AlterColumn<string>(
                name: "UsernameLDAP",
                table: "Complaints",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Complaints",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Complaints",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AlterColumn<string>(
                name: "CategoryMasalah",
                table: "Complaints",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Complaints_Applications_ApplicationId",
                table: "Complaints",
                column: "ApplicationId",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
