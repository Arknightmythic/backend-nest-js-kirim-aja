export const formatDate = (date: Date): string => {
    const formattedDate = date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
        hour12: false,
    });

    return `${formattedDate.replace(/\./g, ':')} WIB`;
}