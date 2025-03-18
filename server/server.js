const express = require('express');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const app = express();
const port = 3100;

app.use(express.json());

// Function to create a zip file from an array of files
function createZip(files, zipFileName) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFileName);
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        });

        output.on('close', () => resolve(zipFileName));
        archive.on('error', reject);
        archive.pipe(output);

        files.forEach((file) => {
            archive.file(file, { name: file });
        });

        archive.finalize();
    });
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

// Example route to download multiple files and bundle them into a zip
app.post('/download-and-zip', async (req, res) => {
    const downloadLinks = req.body; // An array of objects containing URLs and authorization headers
    const downloadedFiles = [];
    const authorizationHeader = { Authorization: req.headers["authorization"] };

    try {
        for (const url of downloadLinks) {
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
                headers: authorizationHeader,
            });

            const fileName = `${makeid(8)}.zip`;
            const fileStream = fs.createWriteStream(fileName);
            response.data.pipe(fileStream);
            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });

            downloadedFiles.push(fileName);
        }

        const zipFileName = 'downloaded_files.zip';
        await createZip(downloadedFiles, zipFileName);

        // Send the zip file as a response
        res.download(zipFileName, (err) => {
            if (err) {
                res.status(500).send('Error sending zip file');
            } else {
                // Clean up the temporary files
                downloadedFiles.forEach((file) => fs.unlinkSync(file));
                // fs.unlinkSync(zipFileName);
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error downloading or creating the zip file.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});