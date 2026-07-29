; Script do instalador do Chrono (Inno Setup).
; Ele pega a pasta gerada pelo PyInstaller (dist\Chrono) e monta um instalador.

[Setup]
AppName=Chrono
AppVersion=1.0.0
AppPublisher=Matheus
; Onde instalar. Com PrivilegesRequired=lowest, isto vira uma pasta do usuario
; (nao precisa de admin), coerente com o "iniciar com o Windows" que usa HKCU.
DefaultDirName={autopf}\Chrono
DisableProgramGroupPage=yes
; Nome do instalador que sera gerado.
OutputBaseFilename=chrono-setup
Compression=lzma
SolidCompression=yes
; lowest = instala so pro usuario atual, SEM pedir senha de administrador.
PrivilegesRequired=lowest
WizardStyle=modern
SetupIconFile=LogoC.ico

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na area de trabalho"; GroupDescription: "Atalhos:"

[Files]
; Pega TUDO que o PyInstaller gerou e joga na pasta de instalacao.
Source: "dist\Chrono\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
; Atalho no Menu Iniciar (sempre) e na area de trabalho (se marcado).
Name: "{autoprograms}\Chrono"; Filename: "{app}\Chrono.exe"
Name: "{autodesktop}\Chrono"; Filename: "{app}\Chrono.exe"; Tasks: desktopicon

[Run]
; Oferece abrir o Chrono logo apos instalar.
Filename: "{app}\Chrono.exe"; Description: "Abrir o Chrono agora"; Flags: nowait postinstall skipifsilent