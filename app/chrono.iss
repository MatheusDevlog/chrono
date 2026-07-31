[Setup]
AppName=Chrono
AppVersion=1.0.0
AppPublisher=Matheus
DefaultDirName={autopf}\Chrono
DisableProgramGroupPage=yes
OutputBaseFilename=chrono-setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
WizardStyle=modern
SetupIconFile=LogoC.ico

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na area de trabalho"; GroupDescription: "Atalhos:"

[Files]
Source: "dist\Chrono\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Chrono"; Filename: "{app}\Chrono.exe"
Name: "{autodesktop}\Chrono"; Filename: "{app}\Chrono.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\Chrono.exe"; Description: "Abrir o Chrono agora"; Flags: nowait postinstall skipifsilent
