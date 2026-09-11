using Microsoft.EntityFrameworkCore;
using backend.Models;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Application> Applications { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Server> Servers { get; set; }
    public DbSet<Complaint> Complaints { get; set; }
    public DbSet<UseCaseRequest> UseCaseRequests { get; set; }
    public DbSet<UserApplicationAccess> UserApplicationAccesses { get; set; }
    public DbSet<DataCenter> DataCenters { get; set; }
    public DbSet<ApplicationServer> ApplicationServers { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
        base.OnModelCreating(modelBuilder);

        // ======================================================
        // DATA CENTER
        // ======================================================

        modelBuilder.Entity<DataCenter>(entity =>
        {
            entity.HasKey(dataCenter => dataCenter.Id);

            entity.Property(dataCenter => dataCenter.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(dataCenter => dataCenter.City)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(dataCenter => dataCenter.Address)
                .HasMaxLength(255);

            entity.HasIndex(dataCenter => dataCenter.Name)
                .IsUnique();
        });


        // ======================================================
        // DATA CENTER -> SERVERS
        // Satu Data Center mempunyai banyak Server
        // ======================================================

        modelBuilder.Entity<Server>(entity =>
        {
            entity.HasKey(server => server.Id);

            entity.HasOne(server => server.DataCenter)
                .WithMany(dataCenter => dataCenter.Servers)
                .HasForeignKey(server => server.DataCenterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(server => server.DataCenterId);

            entity.HasIndex(server => server.IpAddress)
                .IsUnique();

            entity.HasIndex(server => server.Hostname)
                .IsUnique();
        });


        // ======================================================
        // APPLICATION <-> SERVER
        // Relasi many-to-many menggunakan ApplicationServer
        // ======================================================

        modelBuilder.Entity<ApplicationServer>(entity =>
        {
            // Satu aplikasi tidak boleh dipasangkan ke server
            // yang sama lebih dari satu kali.
            entity.HasKey(applicationServer => new
            {
                applicationServer.ApplicationId,
                applicationServer.ServerId
            });

            entity.HasOne(applicationServer =>
                    applicationServer.Application)
                .WithMany(application =>
                    application.ApplicationServers)
                .HasForeignKey(applicationServer =>
                    applicationServer.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(applicationServer =>
                    applicationServer.Server)
                .WithMany(server =>
                    server.ApplicationServers)
                .HasForeignKey(applicationServer =>
                    applicationServer.ServerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(applicationServer =>
                    applicationServer.TenantAplikasi)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(applicationServer =>
                    applicationServer.Function)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(applicationServer =>
                applicationServer.ServerId);
        });

        modelBuilder.Entity<Complaint>(entity =>
        {
            entity.HasOne(complaint => complaint.Application)
                .WithMany(application => application.Complaints)
                .HasForeignKey(complaint => complaint.ApplicationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(complaint => complaint.Status)
                .IsRequired()
                .HasMaxLength(30)
                .HasDefaultValue(ComplaintStatuses.Submitted);

            entity.HasIndex(complaint => complaint.Status);

            entity.HasIndex(complaint => complaint.CreatedAt);
        });

        modelBuilder.Entity<UserApplicationAccess>(entity =>
        {
            // Satu user tidak boleh mendapat akses ke aplikasi yang sama dua kali
            entity.HasKey(access => new
            {
                access.UserId,
                access.ApplicationId
            });

            entity.HasOne(access => access.User)
                .WithMany(user => user.ApplicationAccesses)
                .HasForeignKey(access => access.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(access => access.Application)
                .WithMany(application => application.UserAccesses)
                .HasForeignKey(access => access.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(access => access.AccessLevel)
                .IsRequired()
                .HasMaxLength(50);
        });
        // Relasi Application ↔ User (Pembuat, Pemilik, Backup)
        modelBuilder.Entity<Application>()
            .HasOne(a => a.Pembuat)
            .WithMany()
            .HasForeignKey(a => a.IdPembuat)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Pemilik)
            .WithMany()
            .HasForeignKey(a => a.IdPemilik)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.BackupPemilik)
            .WithMany()
            .HasForeignKey(a => a.IdBackupPemilik)
            .OnDelete(DeleteBehavior.Restrict);



        // Unique Email untuk User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Application)
            .WithMany(a => a.Users)
            .HasForeignKey(u => u.ApplicationId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<UseCaseRequest>(entity =>
        {
            entity.HasKey(request => request.Id);

            entity.HasOne(request => request.Application)
                .WithMany()
                .HasForeignKey(request => request.ApplicationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(request => request.CreatedBy)
                .WithMany()
                .HasForeignKey(request => request.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(request => request.ReviewedBy)
                .WithMany()
                .HasForeignKey(request => request.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(request => request.Status)
                .HasDefaultValue("Submitted");

            entity.HasIndex(request => request.Status);

            entity.HasIndex(request => request.CreatedAt);

            entity.HasIndex(request => request.ApplicationId);

            entity.HasIndex(request => request.CreatedById);
        });

    // ======================================================
    //                  DUMMY DATA
    //
    // 5 Users
    // 3 Servers
    // 10 Applications
    // ======================================================



    // ======================================================
    // IDS
    // ======================================================

    // =========================
    // DATA CENTER IDS
    // =========================

    var dcJakartaSecondaryId = Guid.Parse(
    "40000000-0000-0000-0000-000000000003"
    );

    var dcMedanId = Guid.Parse(
        "40000000-0000-0000-0000-000000000004"
    );

    var dcMakassarId = Guid.Parse(
        "40000000-0000-0000-0000-000000000005"
    );

    var dcBalikpapanId = Guid.Parse(
        "40000000-0000-0000-0000-000000000006"
    );

    var dcJakartaId = Guid.Parse(
        "40000000-0000-0000-0000-000000000001"
    );

    var dcSurabayaId = Guid.Parse(
        "40000000-0000-0000-0000-000000000002"
    );

    // =========================
    // USER IDS
    // =========================

    var adminId = Guid.Parse(
        "10000000-0000-0000-0000-000000000001"
    );

    var budiId = Guid.Parse(
        "10000000-0000-0000-0000-000000000002"
    );

    var sitiId = Guid.Parse(
        "10000000-0000-0000-0000-000000000003"
    );

    var andikaId = Guid.Parse(
        "10000000-0000-0000-0000-000000000004"
    );

    var rinaId = Guid.Parse(
        "10000000-0000-0000-0000-000000000005"
    );


    // =========================
    // SERVER IDS
    // =========================

    var serverJakartaId = Guid.Parse(
        "30000000-0000-0000-0000-000000000001"
    );

    var serverFinanceId = Guid.Parse(
        "30000000-0000-0000-0000-000000000002"
    );

    var serverSecurityId = Guid.Parse(
        "30000000-0000-0000-0000-000000000003"
    );


    // =========================
    // APPLICATION IDS
    // =========================

    var appCatalogId = Guid.Parse(
        "20000000-0000-0000-0000-000000000001"
    );

    var financeId = Guid.Parse(
        "20000000-0000-0000-0000-000000000002"
    );

    var networkId = Guid.Parse(
        "20000000-0000-0000-0000-000000000003"
    );

    var securityId = Guid.Parse(
        "20000000-0000-0000-0000-000000000004"
    );

    var deploymentId = Guid.Parse(
        "20000000-0000-0000-0000-000000000005"
    );

    var inventoryId = Guid.Parse(
        "20000000-0000-0000-0000-000000000006"
    );

    var budgetId = Guid.Parse(
        "20000000-0000-0000-0000-000000000007"
    );

    var employeePortalId = Guid.Parse(
        "20000000-0000-0000-0000-000000000008"
    );

    var apiGatewayId = Guid.Parse(
        "20000000-0000-0000-0000-000000000009"
    );

    var logManagementId = Guid.Parse(
        "20000000-0000-0000-0000-000000000010"
    );


    // Seluruh lokasi dan nama DC berikut adalah dummy untuk demo.
    // Koordinat bukan lokasi infrastruktur perusahaan sebenarnya.

    modelBuilder.Entity<DataCenter>().HasData(
        new DataCenter
        {
            Id = dcJakartaId,
            Name = "Jakarta Central DC Demo",
            City = "Jakarta",
            Address = "Lokasi demo Jakarta pusat",
            Latitude = -6.2088,
            Longitude = 106.8456
        },
        new DataCenter
        {
            Id = dcJakartaSecondaryId,
            Name = "Jakarta South DC Demo",
            City = "Jakarta",
            Address = "Lokasi demo Jakarta selatan",
            Latitude = -6.2892,
            Longitude = 106.8006
        },
        new DataCenter
        {
            Id = dcSurabayaId,
            Name = "Surabaya DC Demo",
            City = "Surabaya",
            Address = "Lokasi demo Surabaya",
            Latitude = -7.2575,
            Longitude = 112.7521
        },
        new DataCenter
        {
            Id = dcMedanId,
            Name = "Medan DC Demo",
            City = "Medan",
            Address = "Lokasi demo Medan",
            Latitude = 3.5952,
            Longitude = 98.6722
        },
        new DataCenter
        {
            Id = dcMakassarId,
            Name = "Makassar DC Demo",
            City = "Makassar",
            Address = "Lokasi demo Makassar",
            Latitude = -5.1477,
            Longitude = 119.4327
        },
        new DataCenter
        {
            Id = dcBalikpapanId,
            Name = "Balikpapan DC Demo",
            City = "Balikpapan",
            Address = "Lokasi demo Balikpapan",
            Latitude = -1.2379,
            Longitude = 116.8529
        }
    );

    // ======================================================
    // 1. ADMIN
    // ======================================================
    //
    // Admin dibuat terlebih dahulu karena Application
    // membutuhkan IdPembuat / Pemilik.
    //
    // Admin tidak dibatasi ke Application tertentu.
    // ======================================================

    modelBuilder.Entity<User>().HasData(
        new User
        {
            Id = adminId,

            ApplicationId = null,

            Username = "admin",
            NIK = "1234567890",
            Nama = "Administrator",

            Email = "admin@example.com",
            Password = "admin123",

            LevelAccess = "Admin",

            Telp = "081234567890",
            Department = "Others",

            AlasanPengajuan =
                "Administrator aplikasi monitoring internal"
        }
    );



    // ======================================================
    // 2. SERVERS
    // ======================================================

    // Waktu tetap agar hasil seeder konsisten setiap membuat migration.
    // Ini snapshot demo, bukan data monitoring real-time.
    var serverSnapshotAt = new DateTime(
        2026, 9, 8, 3, 0, 0, DateTimeKind.Utc
    );

    Server CreateDemoServer(
        int number,
        Guid dataCenterId,
        string region,
        string hostname,
        string ipAddress,
        int cpuCore,
        double memoryGB,
        double diskGB,
        string status,
        double cpuUsage,
        double memoryUsage,
        double diskUsage,
        double availability,
        int responseTimeMs,
        string operatingSystem = "Ubuntu Server 24.04 LTS",
        string environment = "Production")
    {
        return new Server
        {
            // Nomor 1, 2, 3 menghasilkan ID server lama yang sama.
            Id = Guid.Parse(
                $"30000000-0000-0000-0000-{number:D12}"
            ),

            DataCenterId = dataCenterId,

            ServerName = hostname,
            Hostname = hostname,
            IpAddress = ipAddress,

            DeviceType = "Virtual Machine",
            DeviceTypeName = "VMware Virtual Machine",
            OperatingSystem = operatingSystem,
            Environment = environment,
            Rack = $"R01-U{number:D2}",

            CpuCore = cpuCore,
            MemoryGB = memoryGB,
            DiskGB = diskGB,

            Status = status,
            CpuUsage = cpuUsage,
            MemoryUsage = memoryUsage,
            DiskUsage = diskUsage,
            Availability = availability,
            ResponseTimeMs = responseTimeMs,

            // Pada demo ini flag mengikuti status Critical.
            // Bukan penilaian tingkat kepentingan bisnis server.
            IsCritical = status == "Critical",

            AlertLevel = status switch
            {
                "Critical" => "Critical",
                "Offline" => "Critical",
                "Warning" => "Warning",
                _ => "Info"
            },

            LastChecked = serverSnapshotAt,

            Description =
                $"Server dummy {hostname} untuk demo Map dan Tech Info.",

            // Field lama sementara dipertahankan.
            Region = region,

            // Map nantinya menggunakan koordinat DataCenter,
            // bukan koordinat server.
            Latitude = 0,
            Longitude = 0
        };
    }

    modelBuilder.Entity<Server>().HasData(

        // ==================================================
        // JAKARTA CENTRAL — 3 server
        // 2 Online, 1 Warning
        // ==================================================

        CreateDemoServer(
            number: 1,
            dataCenterId: dcJakartaId,
            region: "Jakarta",
            hostname: "jkt-prod-01",
            ipAddress: "10.10.1.11",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 32,
            memoryUsage: 48,
            diskUsage: 55,
            availability: 99.9,
            responseTimeMs: 85
        ),

        CreateDemoServer(
            number: 2,
            dataCenterId: dcJakartaId,
            region: "Jakarta",
            hostname: "jkt-fin-01",
            ipAddress: "10.10.1.12",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 1000,
            status: "Warning",
            cpuUsage: 72,
            memoryUsage: 78,
            diskUsage: 68,
            availability: 98.7,
            responseTimeMs: 230,
            operatingSystem: "Windows Server 2025"
        ),

        CreateDemoServer(
            number: 4,
            dataCenterId: dcJakartaId,
            region: "Jakarta",
            hostname: "jkt-db-01",
            ipAddress: "10.10.1.13",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 2000,
            status: "Online",
            cpuUsage: 41,
            memoryUsage: 58,
            diskUsage: 62,
            availability: 99.98,
            responseTimeMs: 65
        ),

        // ==================================================
        // JAKARTA SOUTH — 3 server
        // Semua Online
        // ==================================================

        CreateDemoServer(
            number: 5,
            dataCenterId: dcJakartaSecondaryId,
            region: "Jakarta",
            hostname: "jks-web-01",
            ipAddress: "10.10.2.11",
            cpuCore: 8,
            memoryGB: 16,
            diskGB: 250,
            status: "Online",
            cpuUsage: 24,
            memoryUsage: 39,
            diskUsage: 42,
            availability: 99.99,
            responseTimeMs: 45
        ),

        CreateDemoServer(
            number: 6,
            dataCenterId: dcJakartaSecondaryId,
            region: "Jakarta",
            hostname: "jks-api-01",
            ipAddress: "10.10.2.12",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 46,
            memoryUsage: 51,
            diskUsage: 35,
            availability: 99.97,
            responseTimeMs: 74
        ),

        CreateDemoServer(
            number: 7,
            dataCenterId: dcJakartaSecondaryId,
            region: "Jakarta",
            hostname: "jks-db-01",
            ipAddress: "10.10.2.13",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 2000,
            status: "Online",
            cpuUsage: 38,
            memoryUsage: 62,
            diskUsage: 57,
            availability: 99.99,
            responseTimeMs: 52
        ),

        // ==================================================
        // SURABAYA — 3 server
        // Online, Warning, Critical
        // ==================================================

        CreateDemoServer(
            number: 3,
            dataCenterId: dcSurabayaId,
            region: "Surabaya",
            hostname: "sby-sec-01",
            ipAddress: "10.20.1.11",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 1000,
            status: "Critical",
            cpuUsage: 94,
            memoryUsage: 91,
            diskUsage: 84,
            availability: 94.5,
            responseTimeMs: 760
        ),

        CreateDemoServer(
            number: 8,
            dataCenterId: dcSurabayaId,
            region: "Surabaya",
            hostname: "sby-web-01",
            ipAddress: "10.20.1.12",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 36,
            memoryUsage: 47,
            diskUsage: 52,
            availability: 99.95,
            responseTimeMs: 90
        ),

        CreateDemoServer(
            number: 9,
            dataCenterId: dcSurabayaId,
            region: "Surabaya",
            hostname: "sby-db-01",
            ipAddress: "10.20.1.13",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 2000,
            status: "Warning",
            cpuUsage: 67,
            memoryUsage: 82,
            diskUsage: 79,
            availability: 99.1,
            responseTimeMs: 260
        ),

        // ==================================================
        // MEDAN — 3 server
        // Semua Online
        // ==================================================

        CreateDemoServer(
            number: 10,
            dataCenterId: dcMedanId,
            region: "Medan",
            hostname: "mdn-web-01",
            ipAddress: "10.30.1.11",
            cpuCore: 4,
            memoryGB: 16,
            diskGB: 250,
            status: "Online",
            cpuUsage: 28,
            memoryUsage: 42,
            diskUsage: 38,
            availability: 99.96,
            responseTimeMs: 95
        ),

        CreateDemoServer(
            number: 11,
            dataCenterId: dcMedanId,
            region: "Medan",
            hostname: "mdn-api-01",
            ipAddress: "10.30.1.12",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 44,
            memoryUsage: 56,
            diskUsage: 49,
            availability: 99.93,
            responseTimeMs: 110
        ),

        CreateDemoServer(
            number: 12,
            dataCenterId: dcMedanId,
            region: "Medan",
            hostname: "mdn-db-01",
            ipAddress: "10.30.1.13",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 1000,
            status: "Online",
            cpuUsage: 39,
            memoryUsage: 61,
            diskUsage: 63,
            availability: 99.98,
            responseTimeMs: 70
        ),

        // ==================================================
        // MAKASSAR — 3 server
        // 2 Online, 1 Warning
        // ==================================================

        CreateDemoServer(
            number: 13,
            dataCenterId: dcMakassarId,
            region: "Makassar",
            hostname: "mks-web-01",
            ipAddress: "10.40.1.11",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 35,
            memoryUsage: 46,
            diskUsage: 41,
            availability: 99.94,
            responseTimeMs: 120
        ),

        CreateDemoServer(
            number: 14,
            dataCenterId: dcMakassarId,
            region: "Makassar",
            hostname: "mks-api-01",
            ipAddress: "10.40.1.12",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Warning",
            cpuUsage: 84,
            memoryUsage: 76,
            diskUsage: 64,
            availability: 98.9,
            responseTimeMs: 340
        ),

        CreateDemoServer(
            number: 15,
            dataCenterId: dcMakassarId,
            region: "Makassar",
            hostname: "mks-db-01",
            ipAddress: "10.40.1.13",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 1000,
            status: "Online",
            cpuUsage: 48,
            memoryUsage: 59,
            diskUsage: 66,
            availability: 99.96,
            responseTimeMs: 85
        ),

        // ==================================================
        // BALIKPAPAN — 3 server
        // Online, Critical, Maintenance
        // ==================================================

        CreateDemoServer(
            number: 16,
            dataCenterId: dcBalikpapanId,
            region: "Balikpapan",
            hostname: "bpn-web-01",
            ipAddress: "10.50.1.11",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 500,
            status: "Online",
            cpuUsage: 31,
            memoryUsage: 43,
            diskUsage: 48,
            availability: 99.9,
            responseTimeMs: 130
        ),

        CreateDemoServer(
            number: 17,
            dataCenterId: dcBalikpapanId,
            region: "Balikpapan",
            hostname: "bpn-db-01",
            ipAddress: "10.50.1.12",
            cpuCore: 16,
            memoryGB: 64,
            diskGB: 2000,
            status: "Critical",
            cpuUsage: 87,
            memoryUsage: 93,
            diskUsage: 96,
            availability: 95.8,
            responseTimeMs: 920
        ),

        CreateDemoServer(
            number: 18,
            dataCenterId: dcBalikpapanId,
            region: "Balikpapan",
            hostname: "bpn-dr-01",
            ipAddress: "10.50.1.13",
            cpuCore: 8,
            memoryGB: 32,
            diskGB: 1000,
            status: "Maintenance",
            cpuUsage: 12,
            memoryUsage: 25,
            diskUsage: 44,
            availability: 98.2,
            responseTimeMs: 180,
            environment: "Disaster Recovery"
        )
    );



    // ======================================================
    // 3. APPLICATIONS
    // ======================================================
    //
    // Semua application dibuat oleh Admin.
    //
    // Untuk dummy awal Pemilik dan BackupPemilik juga
    // menggunakan admin agar tidak terjadi circular FK
    // antara User.ApplicationId dan Application.IdPemilik.
    // ======================================================

    modelBuilder.Entity<Application>().HasData(


        // ==================================================
        // APP 1 - APP CATALOG
        // SERVER JAKARTA
        // ==================================================

        new Application
        {
            Id = appCatalogId,


            NamaAplikasi = "App Catalog SSO",

            Description =
                "Portal katalog dan akses aplikasi internal perusahaan.",

            ApplicationUrl =
                "https://appcatalog.internal",

            Category = "Operations",
            Status = "Active",
            Uptime = 99.95m,
            DataClassification = "Internal",
            DataSource = "Internal Application Database",
            DataRetentionPolicy = "5 Years",

            Version = "2.5.0",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, React, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                1,
                10,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                8,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 2 - FINANCE
        // SERVER FINANCE
        // ==================================================

        new Application
        {
            Id = financeId,


            NamaAplikasi = "Finance Management System",

            Description =
                "Aplikasi internal untuk pengelolaan keuangan dan budgeting.",

            ApplicationUrl =
                "https://finance.internal",

            Category = "Budgeting & Finance",
            Status = "Active",
            Uptime = 95.95m,
            DataClassification = "Confidential",
            DataSource = "Finance Database",
            DataRetentionPolicy = "7 Years",

            Version = "3.2.1",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, Angular, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                1,
                15,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                7,
                28,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 3 - NETWORK MONITORING
        // SERVER SECURITY
        // ==================================================

        new Application
        {
            Id = networkId,


            NamaAplikasi = "Network Monitoring",

            Description =
                "Monitoring kondisi jaringan dan layanan internal.",

            ApplicationUrl =
                "https://network-monitor.internal",

            Category = "Operations",
            Status = "Active",
            Uptime = 97.95m,
            DataClassification = "Internal",
            DataSource = "Network Monitoring API",
            DataRetentionPolicy = "1 Year",

            Version = "4.1.0",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, React, Prometheus",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                2,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                8,
                10,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 4 - SECURITY DASHBOARD
        // SERVER SECURITY
        // ==================================================

        new Application
        {
            Id = securityId,


            NamaAplikasi = "Security Dashboard",

            Description =
                "Dashboard monitoring event dan security internal.",

            ApplicationUrl =
                "https://security.internal",

            Category = "Security",
            Status = "Active",
            Uptime = 92.95m,
            DataClassification = "Restricted",
            DataSource = "Security Event Logs",
            DataRetentionPolicy = "3 Years",

            Version = "2.8.0",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, React, Elasticsearch",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                2,
                10,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                8,
                15,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 5 - DEPLOYMENT MANAGER
        // SERVER JAKARTA
        // ==================================================

        new Application
        {
            Id = deploymentId,


            NamaAplikasi = "Deployment Manager",

            Description =
                "Aplikasi internal untuk pengelolaan deployment.",

            ApplicationUrl =
                "https://deployment.internal",

            Category = "Engineering & Deployment",
            Status = "Active",
            Uptime = 96.95m,
            DataClassification = "Internal",
            DataSource = "CI/CD Platform",
            DataRetentionPolicy = "1 Year",

            Version = "1.9.4",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, Vue, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                3,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                7,
                21,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 6 - INVENTORY
        // SERVER FINANCE
        // ==================================================

        new Application
        {
            Id = inventoryId,


            NamaAplikasi = "Inventory System",

            Description =
                "Aplikasi pengelolaan inventory internal.",

            ApplicationUrl =
                "https://inventory.internal",

            Category = "Operations",
            Status = "Inactive",
            Uptime = 94.95m,

            DataClassification = "Internal",
            DataSource = "Inventory Database",
            DataRetentionPolicy = "3 Years",

            Version = "1.4.2",
            Database = "MySQL",

            TechnologyStack =
                "Laravel, MySQL, Bootstrap",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                3,
                10,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                6,
                20,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 7 - BUDGET PLANNING
        // SERVER FINANCE
        // ==================================================

        new Application
        {
            Id = budgetId,


            NamaAplikasi = "Budget Planning",

            Description =
                "Perencanaan dan monitoring budget internal.",

            ApplicationUrl =
                "https://budget.internal",

            Category = "Budgeting & Finance",
            Status = "Pending",
            Uptime = 93.95m,

            DataClassification = "Confidential",
            DataSource = "Finance Database",
            DataRetentionPolicy = "7 Years",

            Version = "1.0.0",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, React, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                4,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = null
        },


        // ==================================================
        // APP 8 - EMPLOYEE PORTAL
        // SERVER JAKARTA
        // ==================================================

        new Application
        {
            Id = employeePortalId,


            NamaAplikasi = "Employee Portal",

            Description =
                "Portal layanan internal untuk employee.",

            ApplicationUrl =
                "https://employee.internal",

            Category = "Others",
            Status = "Active",
            Uptime = 94.95m,

            DataClassification = "Internal",
            DataSource = "Employee Database",
            DataRetentionPolicy = "5 Years",

            Version = "3.0.5",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, React, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                4,
                12,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                8,
                5,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 9 - API GATEWAY
        // SERVER JAKARTA
        // ==================================================

        new Application
        {
            Id = apiGatewayId,


            NamaAplikasi = "API Gateway",

            Description =
                "Gateway untuk integrasi berbagai API internal.",

            ApplicationUrl =
                "https://gateway.internal",

            Category = "Engineering & Deployment",
            Status = "Active",
            Uptime = 90.95m,
            DataClassification = "Internal",
            DataSource = "Internal APIs",
            DataRetentionPolicy = "1 Year",

            Version = "5.3.0",
            Database = "PostgreSQL",

            TechnologyStack =
                ".NET, Redis, PostgreSQL",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                5,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = new DateTime(
                2026,
                8,
                12,
                0,
                0,
                0,
                DateTimeKind.Utc
            )
        },


        // ==================================================
        // APP 10 - LOG MANAGEMENT
        // SERVER SECURITY
        // ==================================================

        new Application
        {
            Id = logManagementId,


            NamaAplikasi = "Log Management",

            Description =
                "Centralized log management untuk aplikasi internal.",

            ApplicationUrl =
                "https://logs.internal",

            Category = "Security",
            Status = "Pending",
            Uptime = 99.95m,
            DataClassification = "Restricted",
            DataSource = "Application Logs",
            DataRetentionPolicy = "2 Years",

            Version = "1.1.0",
            Database = "Elasticsearch",

            TechnologyStack =
                ".NET, Elasticsearch, Kibana",

            IdPembuat = adminId,
            IdPemilik = adminId,
            IdBackupPemilik = adminId,

            CreatedAt = new DateTime(
                2026,
                5,
                20,
                0,
                0,
                0,
                DateTimeKind.Utc
            ),

            LastUpdated = null
        }
    );

    // ======================================================
    // APPLICATION <-> SERVER
    // Satu aplikasi dapat berjalan di banyak server.
    // Satu server dapat digunakan oleh banyak aplikasi.
    // ======================================================

    ApplicationServer CreateDemoApplicationServer(
        Guid applicationId,
        int serverNumber,
        string tenantAplikasi,
        string function)
    {
        return new ApplicationServer
        {
            ApplicationId = applicationId,

            // Format ID sama dengan CreateDemoServer.
            ServerId = Guid.Parse(
                $"30000000-0000-0000-0000-{serverNumber:D12}"
            ),

            TenantAplikasi = tenantAplikasi,
            Function = function
        };
    }

    modelBuilder.Entity<ApplicationServer>().HasData(

        // APP CATALOG SSO
        CreateDemoApplicationServer(
            appCatalogId, 1, "App Catalog Production", "Web Server"
        ),
        CreateDemoApplicationServer(
            appCatalogId, 5, "App Catalog Production", "Web Replica"
        ),
        CreateDemoApplicationServer(
            appCatalogId, 4, "App Catalog Production", "Database"
        ),
        CreateDemoApplicationServer(
            appCatalogId, 10, "App Catalog Regional", "Web Server"
        ),

        // FINANCE MANAGEMENT SYSTEM
        CreateDemoApplicationServer(
            financeId, 2, "Finance Production", "Application Server"
        ),
        CreateDemoApplicationServer(
            financeId, 4, "Finance Production", "Database"
        ),
        CreateDemoApplicationServer(
            financeId, 8, "Finance Recovery", "Application Replica"
        ),
        CreateDemoApplicationServer(
            financeId, 18, "Finance Recovery", "Disaster Recovery"
        ),

        // NETWORK MONITORING
        CreateDemoApplicationServer(
            networkId, 3, "Network Production", "Monitoring Server"
        ),
        CreateDemoApplicationServer(
            networkId, 6, "Network Production", "Monitoring API"
        ),
        CreateDemoApplicationServer(
            networkId, 11, "Network Regional", "Regional Collector"
        ),
        CreateDemoApplicationServer(
            networkId, 14, "Network Regional", "Regional Collector"
        ),

        // SECURITY DASHBOARD
        CreateDemoApplicationServer(
            securityId, 3, "Security Production", "Security Processor"
        ),
        CreateDemoApplicationServer(
            securityId, 5, "Security Production", "Dashboard"
        ),
        CreateDemoApplicationServer(
            securityId, 9, "Security Production", "Event Database"
        ),
        CreateDemoApplicationServer(
            securityId, 17, "Security Regional", "Event Database"
        ),

        // DEPLOYMENT MANAGER
        CreateDemoApplicationServer(
            deploymentId, 1, "Deployment Production", "Application Server"
        ),
        CreateDemoApplicationServer(
            deploymentId, 6, "Deployment Production", "Deployment API"
        ),
        CreateDemoApplicationServer(
            deploymentId, 7, "Deployment Production", "Database"
        ),

        // INVENTORY SYSTEM
        CreateDemoApplicationServer(
            inventoryId, 2, "Inventory Production", "Application Server"
        ),
        CreateDemoApplicationServer(
            inventoryId, 12, "Inventory Regional", "Database"
        ),
        CreateDemoApplicationServer(
            inventoryId, 13, "Inventory Regional", "Web Server"
        ),
        CreateDemoApplicationServer(
            inventoryId, 15, "Inventory Regional", "Database"
        ),

        // BUDGET PLANNING
        CreateDemoApplicationServer(
            budgetId, 2, "Budget Staging", "Application Server"
        ),
        CreateDemoApplicationServer(
            budgetId, 4, "Budget Staging", "Database"
        ),
        CreateDemoApplicationServer(
            budgetId, 18, "Budget Recovery", "Disaster Recovery"
        ),

        // EMPLOYEE PORTAL
        CreateDemoApplicationServer(
            employeePortalId, 1, "Employee Production", "Web Server"
        ),
        CreateDemoApplicationServer(
            employeePortalId, 10, "Employee Regional", "Web Server"
        ),
        CreateDemoApplicationServer(
            employeePortalId, 13, "Employee Regional", "Web Server"
        ),
        CreateDemoApplicationServer(
            employeePortalId, 16, "Employee Regional", "Web Server"
        ),
        CreateDemoApplicationServer(
            employeePortalId, 7, "Employee Production", "Database"
        ),

        // API GATEWAY
        CreateDemoApplicationServer(
            apiGatewayId, 1, "Gateway Production", "Gateway Service"
        ),
        CreateDemoApplicationServer(
            apiGatewayId, 6, "Gateway Production", "Gateway Replica"
        ),
        CreateDemoApplicationServer(
            apiGatewayId, 11, "Gateway Regional", "Regional Gateway"
        ),
        CreateDemoApplicationServer(
            apiGatewayId, 14, "Gateway Regional", "Regional Gateway"
        ),
        CreateDemoApplicationServer(
            apiGatewayId, 16, "Gateway Regional", "Regional Gateway"
        ),

        // LOG MANAGEMENT
        CreateDemoApplicationServer(
            logManagementId, 3, "Logging Staging", "Log Processor"
        ),
        CreateDemoApplicationServer(
            logManagementId, 9, "Logging Staging", "Log Storage"
        ),
        CreateDemoApplicationServer(
            logManagementId, 12, "Logging Regional", "Log Storage"
        ),
        CreateDemoApplicationServer(
            logManagementId, 15, "Logging Regional", "Log Storage"
        ),
        CreateDemoApplicationServer(
            logManagementId, 17, "Logging Regional", "Log Storage"
        )
    );


    // ======================================================
    // 4. USER BIASA
    // ======================================================
    //
    // Dibuat setelah application.
    //
    // Setiap akun hanya diberi akses ke SATU application.
    // ======================================================

    modelBuilder.Entity<User>().HasData(

        // --------------------------------------------------
        // BUDI -> FINANCE
        // --------------------------------------------------

        new User
        {
            Id = budiId,

            ApplicationId = financeId,

            Username = "budi",
            NIK = "1234567891",
            Nama = "Budi Santoso",

            Email = "budi@example.com",
            Password = "user123",

            LevelAccess = "Read Only",

            Telp = "081234567891",
            Department = "Budgeting & Finance",

            AlasanPengajuan =
                "Akses monitoring Finance Management System"
        },


        // --------------------------------------------------
        // SITI -> APP CATALOG
        // --------------------------------------------------

        new User
        {
            Id = sitiId,

            ApplicationId = appCatalogId,

            Username = "siti",
            NIK = "1234567892",
            Nama = "Siti Rahma",

            Email = "siti@example.com",
            Password = "user123",

            LevelAccess = "Read And Write",

            Telp = "081234567892",
            Department = "Operations",

            AlasanPengajuan =
                "Akses pengelolaan App Catalog SSO"
        },


        // --------------------------------------------------
        // ANDIKA -> NETWORK MONITORING
        // --------------------------------------------------

        new User
        {
            Id = andikaId,

            ApplicationId = networkId,

            Username = "andika",
            NIK = "1234567893",
            Nama = "Andika Putra",

            Email = "andika@example.com",
            Password = "user123",

            LevelAccess = "Read And Write",

            Telp = "081234567893",
            Department = "Operations",

            AlasanPengajuan =
                "Akses monitoring Network Monitoring"
        },


        // --------------------------------------------------
        // RINA -> SECURITY DASHBOARD
        // --------------------------------------------------

        new User
        {
            Id = rinaId,

            ApplicationId = securityId,

            Username = "rina",
            NIK = "1234567894",
            Nama = "Rina Wijaya",

            Email = "rina@example.com",
            Password = "user123",

            LevelAccess = "Read Only",

            Telp = "081234567894",
            Department = "Security",

            AlasanPengajuan =
                "Akses monitoring Security Dashboard"
        }


        // ======================================================
        // COMPLAINT SEED DATA
        // ======================================================


    );

    modelBuilder.Entity<Complaint>().HasData(
     // 1. Complaint App Catalog - Resolved
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000001"
            ),

            FullName = "Budi Santoso",
            Email = "budi@example.com",
            Phone = "081234567891",
            Regional = "HQ",

            IssueType = "User Management",
            ApplicationId = appCatalogId,
            Category = "Reviewer User",

            LdapUsername = "budi",
            Role = "Read Only",

            Description =
                "User tidak dapat membuka menu reviewer pada aplikasi.",

            Status = ComplaintStatuses.Resolved,

            ResolutionNote =
                "Akses reviewer telah ditambahkan oleh administrator.",

            CreatedAt = new DateTime(
                2026, 8, 21, 2, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 21, 5, 30, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = new DateTime(
                2026, 8, 21, 5, 30, 0,
                DateTimeKind.Utc
            )
        },

        // 2. Complaint App Catalog - Checking
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000002"
            ),

            FullName = "Siti Rahma",
            Email = "siti@example.com",
            Phone = "081234567892",
            Regional = "RI SUMBAGUT",

            IssueType = "User Management",
            ApplicationId = appCatalogId,
            Category = "Reviewer User",

            LdapUsername = "siti",
            Role = "Read And Write",

            Description =
                "Role pengguna tidak sesuai dengan jabatan yang dimiliki.",

            Status = ComplaintStatuses.Checking,

            ResolutionNote =
                "Sedang dilakukan pengecekan role dan department pengguna.",

            CreatedAt = new DateTime(
                2026, 8, 22, 3, 15, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 22, 6, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = null
        },

        // 3. Complaint Finance - Checking
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000003"
            ),

            FullName = "Rina Wijaya",
            Email = "rina@example.com",
            Phone = "081234567894",
            Regional = "HQ",

            IssueType = "Data Not Synchronize",
            ApplicationId = financeId,
            Category = "Data Not Synchronize",

            LdapUsername = null,
            Role = null,

            Description =
                "Data transaksi terbaru belum muncul pada dashboard finance.",

            Status = ComplaintStatuses.Checking,

            ResolutionNote =
                "Tim sedang memeriksa proses sinkronisasi database.",

            CreatedAt = new DateTime(
                2026, 8, 23, 1, 45, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 23, 4, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = null
        },

        // 4. Complaint Finance - Submitted
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000004"
            ),

            FullName = "Administrator",
            Email = "admin@example.com",
            Phone = "081234567890",
            Regional = "HQ",

            IssueType = "Performance",
            ApplicationId = financeId,
            Category = "KPI",

            LdapUsername = null,
            Role = null,

            Description =
                "Halaman KPI membutuhkan waktu cukup lama untuk ditampilkan.",

            Status = ComplaintStatuses.Submitted,

            ResolutionNote = null,

            CreatedAt = new DateTime(
                2026, 8, 24, 2, 30, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = null,
            ResolvedAt = null
        },

        // 5. Complaint Network Monitoring - Submitted
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000005"
            ),

            FullName = "Andika Putra",
            Email = "andika@example.com",
            Phone = "081234567893",
            Regional = "R4 WEST JAVA",

            IssueType = "Performance",
            ApplicationId = networkId,
            Category = "RH Visit",

            LdapUsername = null,
            Role = null,

            Description =
                "Dashboard network monitoring sering mengalami loading lama.",

            Status = ComplaintStatuses.Submitted,

            ResolutionNote = null,

            CreatedAt = new DateTime(
                2026, 8, 25, 1, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = null,
            ResolvedAt = null
        },

        // 6. Complaint Network Monitoring - Resolved
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000006"
            ),

            FullName = "Andika Putra",
            Email = "andika@example.com",
            Phone = "081234567893",
            Regional = "R6 EAST JAVA",

            // Mengikuti value pada dropdown frontend
            IssueType = "Aplication Error",

            ApplicationId = networkId,
            Category = "Ticketing Handling",

            LdapUsername = null,
            Role = null,

            Description =
                "Tombol pembuatan ticket tidak merespons ketika diklik.",

            Status = ComplaintStatuses.Resolved,

            ResolutionNote =
                "Masalah pada endpoint ticketing telah diperbaiki.",

            CreatedAt = new DateTime(
                2026, 8, 25, 4, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 26, 2, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = new DateTime(
                2026, 8, 26, 2, 0, 0,
                DateTimeKind.Utc
            )
        },

        // 7. Complaint Security Dashboard - Closed
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000007"
            ),

            FullName = "Rina Wijaya",
            Email = "rina@example.com",
            Phone = "081234567894",
            Regional = "HQ",

            IssueType = "Aplication Error",
            ApplicationId = securityId,
            Category = "Ticketing Handling",

            LdapUsername = null,
            Role = null,

            Description =
                "Notifikasi security alert tidak dapat dibuka.",

            Status = ComplaintStatuses.Closed,

            ResolutionNote =
                "Complaint ditutup setelah perbaikan dan konfirmasi pengguna.",

            CreatedAt = new DateTime(
                2026, 8, 26, 3, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 27, 2, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = new DateTime(
                2026, 8, 27, 2, 0, 0,
                DateTimeKind.Utc
            )
        },

        // 8. Complaint Deployment Manager - Checking
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000008"
            ),

            FullName = "Budi Santoso",
            Email = "budi@example.com",
            Phone = "081234567891",
            Regional = "R4 WEST JAVA",

            IssueType = "Data Not Synchronize",
            ApplicationId = deploymentId,
            Category = "Data Not Synchronize",

            LdapUsername = null,
            Role = null,

            Description =
                "Riwayat deployment terbaru belum tampil pada dashboard.",

            Status = ComplaintStatuses.Checking,

            ResolutionNote =
                "Sedang dilakukan pengecekan deployment service.",

            CreatedAt = new DateTime(
                2026, 8, 27, 5, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 28, 1, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = null
        },

        // 9. Complaint Inventory - Resolved
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000009"
            ),

            FullName = "Siti Rahma",
            Email = "siti@example.com",
            Phone = "081234567892",
            Regional = "R6 EAST JAVA",

            IssueType = "Data Not Synchronize",
            ApplicationId = inventoryId,
            Category = "Data Not Synchronize",

            LdapUsername = null,
            Role = null,

            Description =
                "Jumlah stok pada dashboard berbeda dengan database.",

            Status = ComplaintStatuses.Resolved,

            ResolutionNote =
                "Proses sinkronisasi stok telah dijalankan ulang.",

            CreatedAt = new DateTime(
                2026, 8, 28, 3, 0, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = new DateTime(
                2026, 8, 29, 2, 0, 0,
                DateTimeKind.Utc
            ),

            ResolvedAt = new DateTime(
                2026, 8, 29, 2, 0, 0,
                DateTimeKind.Utc
            )
        },

        // 10. Complaint Budget Planning - Submitted
        new Complaint
        {
            Id = Guid.Parse(
                "40000000-0000-0000-0000-000000000010"
            ),

            FullName = "Administrator",
            Email = "admin@example.com",
            Phone = "081234567890",
            Regional = "HQ",

            IssueType = "Performance",
            ApplicationId = budgetId,
            Category = "KPI",

            LdapUsername = null,
            Role = null,

            Description =
                "Proses menampilkan laporan anggaran berjalan lambat.",

            Status = ComplaintStatuses.Submitted,

            ResolutionNote = null,

            CreatedAt = new DateTime(
                2026, 8, 29, 4, 30, 0,
                DateTimeKind.Utc
            ),

            UpdatedAt = null,
            ResolvedAt = null
        }
    );

    modelBuilder.Entity<UseCaseRequest>().HasData(
        new UseCaseRequest
        {
            Id = Guid.Parse(
                "50000000-0000-0000-0000-000000000001"
            ),
            ApplicationId = appCatalogId,
            Pic = "PIC App Catalog",
            UseCaseName = "Single Sign-On Monitoring",
            Description =
                "Monitoring proses login dan autentikasi pengguna.",
            Objective =
                "Memastikan proses login aplikasi tetap tersedia dan aman.",
            FeasibilityBenefit =
                "Mengurangi gangguan login dan mempercepat identifikasi masalah autentikasi.",
            CustodyPic = "Operations",
            Status = "Approved",
            ReviewNote =
                "Use case disetujui untuk proses implementasi.",
            CreatedById = budiId,
            ReviewedById = adminId,
            CreatedAt = new DateTime(
                2026, 8, 20, 2, 0, 0,
                DateTimeKind.Utc
            ),
            UpdatedAt = new DateTime(
                2026, 8, 21, 3, 0, 0,
                DateTimeKind.Utc
            ),
            ReviewedAt = new DateTime(
                2026, 8, 21, 3, 0, 0,
                DateTimeKind.Utc
            )
        },

        new UseCaseRequest
        {
            Id = Guid.Parse(
                "50000000-0000-0000-0000-000000000002"
            ),
            ApplicationId = financeId,
            Pic = "PIC Finance",
            UseCaseName = "Budget Anomaly Detection",
            Description =
                "Mendeteksi anomali pada penggunaan budget perusahaan.",
            Objective =
                "Memberikan peringatan ketika penggunaan budget tidak sesuai perencanaan.",
            FeasibilityBenefit =
                "Mempercepat proses pemeriksaan transaksi dan penggunaan anggaran.",
            CustodyPic = "Budgeting & Finance",
            Status = "In Review",
            CreatedById = sitiId,
            CreatedAt = new DateTime(
                2026, 8, 24, 3, 0, 0,
                DateTimeKind.Utc
            ),
            UpdatedAt = new DateTime(
                2026, 8, 25, 4, 0, 0,
                DateTimeKind.Utc
            )
        },

        new UseCaseRequest
        {
            Id = Guid.Parse(
                "50000000-0000-0000-0000-000000000003"
            ),
            ApplicationId = networkId,
            Pic = "PIC Network",
            UseCaseName = "Network Incident Prediction",
            Description =
                "Memprediksi kemungkinan gangguan jaringan berdasarkan data monitoring.",
            Objective =
                "Mengurangi risiko downtime pada layanan internal.",
            FeasibilityBenefit =
                "Membantu tim melakukan tindakan sebelum gangguan menjadi kritis.",
            CustodyPic = "Operations",
            Status = "Submitted",
            CreatedById = andikaId,
            CreatedAt = new DateTime(
                2026, 8, 27, 4, 0, 0,
                DateTimeKind.Utc
            )
        },

        new UseCaseRequest
        {
            Id = Guid.Parse(
                "50000000-0000-0000-0000-000000000004"
            ),
            ApplicationId = securityId,
            Pic = "PIC Security",
            UseCaseName = "Security Alert Correlation",
            Description =
                "Menghubungkan beberapa security alert untuk menemukan pola serangan.",
            Objective =
                "Meningkatkan kemampuan identifikasi insiden keamanan.",
            FeasibilityBenefit =
                "Mengurangi alert palsu dan membantu proses investigasi.",
            CustodyPic = "Security",
            Status = "Rejected",
            ReviewNote =
                "Sumber data dan ruang lingkup use case belum cukup jelas.",
            CreatedById = rinaId,
            ReviewedById = adminId,
            CreatedAt = new DateTime(
                2026, 8, 28, 5, 0, 0,
                DateTimeKind.Utc
            ),
            UpdatedAt = new DateTime(
                2026, 8, 29, 6, 0, 0,
                DateTimeKind.Utc
            ),
            ReviewedAt = new DateTime(
                2026, 8, 29, 6, 0, 0,
                DateTimeKind.Utc
            )
        }
    );
}

}