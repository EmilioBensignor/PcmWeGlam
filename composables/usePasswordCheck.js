export const usePasswordCheck = () => {
    const passwordCache = useState('password_check_cache', () => new Map());
    const checkingPassword = ref(false);

    const checkPasswordLeak = async (password) => {
        if (!password || password.length < 8) return false;

        if (passwordCache.value.has(password)) {
            return passwordCache.value.get(password);
        }

        checkingPassword.value = true;

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);

            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5).toUpperCase();

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
                signal: controller.signal,
                headers: { 'User-Agent': 'NuxtSupabaseApp' }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn('Error al consultar API de contraseñas');
                return false;
            }

            const text = await response.text();

            const isCompromised = text.split('\r\n').some(line => {
                const [hashSuffix] = line.split(':');
                return hashSuffix.toUpperCase() === suffix;
            });

            passwordCache.value.set(password, isCompromised);

            return isCompromised;
        } catch (error) {
            console.error('Error al verificar contraseña:', error);
            return false;
        } finally {
            checkingPassword.value = false;
        }
    };

    const clearPasswordCache = () => {
        if (passwordCache.value.size > 50) {
            passwordCache.value.clear();
        }
    };

    return {
        checkPasswordLeak,
        checkingPassword,
        clearPasswordCache
    };
};