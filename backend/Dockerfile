# Step 1: SDK Image use krna build ke liye (.NET 10 Preview/LTS)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Step 2: .csproj file copy krna aur dependencies restore krna
# (Apne project ki .csproj file ka actual naam 'NexusBackend' ki jagah likhein)
COPY ["NexusBackend.csproj", "./"]
RUN dotnet restore "./NexusBackend.csproj"

# Step 3: Baki saara code copy krna aur publish build nikalna
COPY . .
RUN dotnet publish "NexusBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Step 4: Runtime image create krna jo container ko lightweight rkhy gi
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Step 5: Render ke liye standard port expose krna
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Step 6: App run krne ki command
# (Apne project ki built .dll file ka naam 'YourProjectName' ki jagah likhein)
ENTRYPOINT ["dotnet", "NexusBackend.dll"]