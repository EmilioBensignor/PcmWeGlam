export const useRealtimeSubscription = () => {
    const supabase = useSupabaseClient();

    const subscribeToTable = (tableName, callback) => {
        const channel = supabase
            .channel(`public:${tableName}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: tableName
            }, payload => {
                callback(payload);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    return { subscribeToTable };
};