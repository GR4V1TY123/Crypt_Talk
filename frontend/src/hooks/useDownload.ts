export default async function useDownload({ messages, username, room }: any) {
    const requestBody = {
        messages, username, room
    }
    console.log(requestBody);

    const res = await fetch("http://localhost:3000/api/report", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        throw new Error("Failed to download PDF");
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${username}-${room.roomId}.pdf`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

}
