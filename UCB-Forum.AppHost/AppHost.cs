var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql");
var database = sql.AddDatabase("DefaultConnection");

var server = builder.AddProject<Projects.UCB_Forum_Server>("server")
    .WithReference(database)
    .WaitFor(database)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
