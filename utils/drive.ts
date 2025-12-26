
export const DRIVE_CLIENT_ID = '439268759553-6o1m79860472v4492m56h236f047466f.apps.googleusercontent.com';

let gapiToken: string | null = null;

export const initDrive = async () => {
    return new Promise<void>((resolve) => {
        (window as any).gapi.load('client', async () => {
            await (window as any).gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });
            resolve();
        });
    });
};

export const signInToDrive = async () => {
    return new Promise<string>((resolve, reject) => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: DRIVE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (response: any) => {
                if (response.error !== undefined) {
                    reject(response);
                }
                gapiToken = response.access_token;
                resolve(gapiToken!);
            },
        });
        client.requestAccessToken({ prompt: 'consent' });
    });
};

export const uploadToDrive = async (blob: Uint8Array) => {
    if (!gapiToken) throw new Error("Not signed in to Drive");
    
    const fileMetadata = {
        'name': 'getdone_backup.sqlite',
        'mimeType': 'application/x-sqlite3'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([blob]));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + gapiToken }),
        body: form
    });
    
    return response.json();
};
