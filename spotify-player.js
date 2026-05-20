// ==========================================
// REPRODUCTOR DE SPOTIFY MINIMALISTA
// ==========================================

// CONFIGURACIÓN - Necesitas registrar tu app en https://developer.spotify.com/
const SPOTIFY_CONFIG = {
    clientId: 'TU_CLIENT_ID_AQUI', // Reemplazar con tu Client ID
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'streaming',
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'user-top-read',
        'user-read-playback-state',
        'user-modify-playback-state',
        'playlist-read-private',
        'playlist-read-collaborative'
    ]
};

class SpotifyPlayer {
    constructor() {
        this.accessToken = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.playlists = [];
        this.selectedPlaylist = null;
        this.deviceId = null;
        this.init();
    }

    async init() {
        // Verificar si hay token en URL (después del login)
        this.checkAndSetToken();
        
        if (this.accessToken) {
            await this.initializePlayer();
            this.setupEventListeners();
            document.getElementById('spotify-login').style.display = 'none';
            document.getElementById('spotify-player').style.display = 'block';
        }
    }

    checkAndSetToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const expiresIn = params.get('expires_in');
        
        if (token) {
            this.accessToken = token;
            localStorage.setItem('spotify_token', token);
            
            // Guardar tiempo de expiración
            const expirationTime = Date.now() + (parseInt(expiresIn || 3600) * 1000);
            localStorage.setItem('spotify_token_expiry', expirationTime);
            
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            this.accessToken = localStorage.getItem('spotify_token');
            
            // Verificar si el token ha expirado
            const expiryTime = localStorage.getItem('spotify_token_expiry');
            if (expiryTime && Date.now() > parseInt(expiryTime)) {
                this.logout();
            }
        }
    }

    loginWithSpotify() {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CONFIG.clientId}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.redirectUri)}&scope=${encodeURIComponent(SPOTIFY_CONFIG.scopes.join(' '))}`;
        window.location.href = authUrl;
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('spotify_token');
        document.getElementById('spotify-login').style.display = 'block';
        document.getElementById('spotify-player').style.display = 'none';
        location.reload();
    }

    async initializePlayer() {
        try {
            // Cargar playlists del usuario
            await this.loadPlaylists();
            
            // Cargar dispositivos disponibles
            await this.getAvailableDevices();
            
            // Cargar canción actual
            await this.updateCurrentTrack();
            
            // Actualizar cada 1 segundo
            setInterval(() => this.updateCurrentTrack(), 1000);
        } catch (error) {
            console.error('Error inicializando reproductor:', error);
            this.showError('Error al inicializar el reproductor');
        }
    }

    showError(message) {
        const trackName = document.getElementById('track-name');
        if (trackName) {
            trackName.textContent = '⚠️ ' + message;
            trackName.style.color = 'var(--accent-hover)';
        }
    }

    setupEventListeners() {
        document.getElementById('play-btn')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousTrack());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextTrack());
        document.getElementById('spotify-logout')?.addEventListener('click', () => this.logout());
        document.getElementById('playlist-select')?.addEventListener('change', (e) => this.selectPlaylist(e.target.value));
    }

    async loadPlaylists() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            const data = await response.json();
            this.playlists = data.items || [];
            this.updatePlaylistSelect();
        } catch (error) {
            console.error('Error cargando playlists:', error);
        }
    }

    updatePlaylistSelect() {
        const select = document.getElementById('playlist-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecciona una playlist...</option>';
        this.playlists.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.name;
            select.appendChild(option);
        });
    }

    async selectPlaylist(playlistId) {
        if (!playlistId) return;
        
        try {
            this.selectedPlaylist = this.playlists.find(p => p.id === playlistId);
            // Reproducir primera canción de la playlist
            await this.playPlaylist(playlistId);
        } catch (error) {
            console.error('Error seleccionando playlist:', error);
        }
    }

    async playPlaylist(playlistId) {
        try {
            await fetch(`https://api.spotify.com/v1/me/player/play`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context_uri: `spotify:playlist:${playlistId}`
                })
            });
        } catch (error) {
            console.error('Error reproduciendo playlist:', error);
        }
    }

    async getAvailableDevices() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            const data = await response.json();
            if (data.devices && data.devices.length > 0) {
                this.deviceId = data.devices[0].id;
            } else {
                console.warn('No hay dispositivos disponibles en Spotify. Abre Spotify en otro dispositivo o abre la web de Spotify.');
                this.showError('Sin dispositivos - Abre Spotify');
            }
        } catch (error) {
            console.error('Error obteniendo dispositivos:', error);
        }
    }

    async updateCurrentTrack() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            // Si el token expiró (401), desconectar
            if (response.status === 401) {
                console.warn('Token de Spotify expirado. Por favor, vuelve a conectar.');
                this.logout();
                return;
            }
            
            if (response.status === 204) return; // No hay canción reproduciendo
            
            const data = await response.json();
            if (data.item) {
                this.currentTrack = {
                    name: data.item.name,
                    artist: data.item.artists.map(a => a.name).join(', '),
                    image: data.item.album.images[0]?.url,
                    uri: data.item.uri,
                    id: data.item.id
                };
                this.isPlaying = data.is_playing;
                this.updatePlayerUI();
            }
        } catch (error) {
            console.error('Error actualizando canción:', error);
        }
    }

    updatePlayerUI() {
        const trackName = document.getElementById('track-name');
        const trackArtist = document.getElementById('track-artist');
        const trackImage = document.getElementById('track-image');
        const playBtn = document.getElementById('play-btn');
        
        if (this.currentTrack) {
            if (trackName) trackName.textContent = this.currentTrack.name;
            if (trackArtist) trackArtist.textContent = this.currentTrack.artist;
            if (trackImage && this.currentTrack.image) {
                trackImage.src = this.currentTrack.image;
                trackImage.style.display = 'block';
            }
        }
        
        // Actualizar botón de play
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>';
        }
    }

    async togglePlayPause() {
        try {
            const endpoint = this.isPlaying ? 'pause' : 'play';
            await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            this.isPlaying = !this.isPlaying;
            this.updatePlayerUI();
        } catch (error) {
            console.error('Error en play/pause:', error);
        }
    }

    async nextTrack() {
        try {
            await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            await this.updateCurrentTrack();
        } catch (error) {
            console.error('Error en siguiente canción:', error);
        }
    }

    async previousTrack() {
        try {
            await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            await this.updateCurrentTrack();
        } catch (error) {
            console.error('Error en canción anterior:', error);
        }
    }
}

// Inicializar reproductor cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.spotifyPlayer = new SpotifyPlayer();
});
