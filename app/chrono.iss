#define MyAppVersion "1.1.0"

[Setup]
AppId={{6751403F-1DBA-4FA7-B04B-AEDA130215C3}
AppName=Chrono
AppVersion={#MyAppVersion}
AppVerName=Chrono {#MyAppVersion}
AppPublisher=Matheus Santos Cunha
AppPublisherURL=https://github.com/MatheusDevlog/chrono
DefaultDirName={autopf}\Chrono
DisableProgramGroupPage=yes
OutputBaseFilename=chrono-setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
WizardStyle=modern
SetupIconFile=LogoC.ico
UninstallDisplayIcon={app}\Chrono.exe
UninstallDisplayName=Chrono
VersionInfoVersion={#MyAppVersion}

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na area de trabalho"; GroupDescription: "Atalhos:"

[Files]
Source: "dist\Chrono\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Chrono"; Filename: "{app}\Chrono.exe"
Name: "{autodesktop}\Chrono"; Filename: "{app}\Chrono.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\Chrono.exe"; Description: "Abrir o Chrono agora"; Flags: nowait postinstall skipifsilent
