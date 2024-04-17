const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const { dialog } = require('electron');
const { exec } = require('child_process');
const musicMetadata = require('music-metadata');

const songsPath = path.join(__dirname, './audio_input/songs-mp3/');
const outputDirectory = path.join(__dirname, './audio_input/vocals_instrumentals');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            // If you are using Electron 12 or later, you need to enable contextIsolation and use preload scripts for more secure integrations
            contextIsolation: false,
        }
    });

    // Load the index.html of the app.
    mainWindow.loadFile('frontend/index.html');

    // Open the DevTools. - You can comment this line if you don't want the DevTools to open automatically
    // mainWindow.webContents.openDevTools();
}

ipcMain.on('separate-instrumental', (event, song) => {
    // Construct the full path to the song using the song name received from the renderer
    const songPath = path.join(songsPath, song);
    const scriptPath = path.join(__dirname, 'src/GetAudio.py');
    
    // Use the songPath as the input for the Python script
    const command = `python "${scriptPath}" "${songPath}" "${outputDirectory}"`;

    console.log(`About to process file: ${songPath}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during the audio separation: ${stderr}`);
            event.reply('separation-failed', { error: stderr });
        } else {
            // Assuming the script outputs the path to the instrumental file
            const instrumentalPath = stdout.trim(); // Adjust this line if needed
            console.log(`Instrumental created: ${instrumentalPath}`);
            event.reply('instrumental-created', { instrumentalPath });
        }
    });
});

ipcMain.on('separate-vocal', (event, song) => {
    // Construct the full path to the song using the song name received from the renderer
    const songPath = path.join(songsPath, song);
    const scriptPath = path.join(__dirname, 'src/GetAudio.py');
    
    // Use the songPath as the input for the Python script
    const command = `python "${scriptPath}" "${songPath}" "${outputDirectory}"`;

    console.log(`About to process file: ${songPath}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during the audio separation: ${stderr}`);
            event.reply('separation-failed', { error: stderr });
        } else {
            // Assuming the script outputs the path to the instrumental file
            const vocalPath = path.join(outputPath, "vocals.wav");
            console.log(`vocal created: ${vocalPath}`);
            event.reply('vocal-created', { vocalPath });
        }
    });
});

ipcMain.on('get-songs', (event) => {
    console.log(`Looking for songs in: ${songsPath}`);
    
    fs.readdir(songsPath, (err, files) => {
        if (err) {
            console.error('Error reading songs directory', err);
            event.reply('get-songs-response', []); // Send an empty array on error
        } else {
            console.log(`Found files: ${files.join(', ')}`);
            const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));
            console.log(`Filtered MP3 files: ${mp3Files.join(', ')}`);
            event.reply('get-songs-response', mp3Files); // Send the list of songs back
        }
    });
});

ipcMain.on('get-album-metadata', async (event, args) => {
    const { songPath } = args;
    if (typeof songPath !== 'string') {
        console.error('Invalid songPath received:', songPath);
        event.reply('album-metadata-response', { success: false, error: 'Invalid songPath' });
        return;
    }

    try {
        const metadata = await musicMetadata.parseFile(songPath);
        event.reply('album-metadata-response', { success: true, metadata: metadata.common });
    } catch (error) {
        console.error('Failed to get album metadata:', error);
        event.reply('album-metadata-response', { success: false, error: error.message });
    }
});

// main.js
ipcMain.on('get-songs', (event, playlistId) => {
    // You would need to have a way to map playlist IDs to their songs
    // For simplicity, let's assume all songs are in every playlist for now.
    fs.readdir(songsPath, (err, files) => {
        if (err) {
            event.reply('get-songs-response', []); // Send an empty array on error
        } else {
            const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));
            event.reply('get-songs-response', mp3Files); // Send the list of songs back
        }
    });
});

ipcMain.on('get-album-art', async (event, songPath) => {
    try {
      const metadata = await musicMetadata.parseFile(songPath);
      const picture = metadata.common.picture[0]; // Taking the first image
      if (picture) {
        // Convert picture object to a base64 string
        const image = `data:${picture.format};base64,${picture.data.toString('base64')}`;
        event.reply('album-art-reply', image);
      }
    } catch (error) {
      console.error('Error extracting album art', error);
      event.reply('album-art-reply', null);
    }
});

ipcMain.on('save-instrumental', async (event, filePath) => {
  // Show a save dialog to the user
  const { canceled, filePath: savePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Instrumental',
      defaultPath: path.join(app.getPath('music'), 'instrumental.mp3') // Set default filename and directory
  });

  if (canceled) {
      // User canceled the save dialog
      return;
  }

  // Copy the file to the new location
  try {
      await fs.copyFile(filePath, savePath);
      event.reply('instrumental-saved', savePath); // Notify the renderer process that the save was successful
  } catch (err) {
      console.error('Failed to save the file', err);
  }
});

// This method will be called when Electron has finished initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


ipcMain.on('get-vocals', (event, song) => {
    const vocalsPath = path.join(__dirname, `./audio_input/vocals_instrumentals/${song.replace(/\.[^/.]+$/, "")}/vocals.mp3`);
    console.log(`Checking for vocal file at: ${vocalsPath}`);
    
    fs.stat(vocalsPath, (err, stats) => {
        if (err) {
            console.error('Error accessing vocal file', err);
            event.reply('get-vocals-response', { song, exists: false });
        } else if (stats.isFile()) {
            console.log(`Vocal file found for ${song}`);
            event.reply('get-vocals-response', { song, exists: true, vocalPath: vocalsPath });
        } else {
            console.log(`No vocal file found for ${song}`);
            event.reply('get-vocals-response', { song, exists: false });
        }
    });
});

ipcMain.on('get-instrumentals', (event, song) => {
    const instrumentalPath = path.join(__dirname, `./audio_input/vocals_instrumentals/${song.replace(/\.[^/.]+$/, "")}/instrumental.mp3`);
    console.log(`Checking for instrumental file at: ${instrumentalPath}`);
    
    fs.stat(instrumentalPath, (err, stats) => {
        if (err) {
            console.error('Error accessing instrumental file', err);
            event.reply('get-instrumentals-response', { song, exists: false });
        } else if (stats.isFile()) {
            console.log(`Instrumental file found for ${song}`);
            event.reply('get-instrumentals-response', { song, exists: true, instrumentalPath: instrumentalPath });
        } else {
            console.log(`No instrumental file found for ${song}`);
            event.reply('get-instrumentals-response', { song, exists: false });
        }
    });
});

ipcMain.on('get-clean-songs', (event, song) => {
    // Extract the base name without the extension
    const baseName = path.basename(song, '.mp3');
    // Construct the clean song path with "(C)" before the ".mp3" extension
    const cleanFilePath = path.join(__dirname, './audio_input/cleaned_songs', `${baseName}(C).mp3`);
    console.log(`Checking for clean file at: ${cleanFilePath}`);

    fs.stat(cleanFilePath, (err, stats) => {
        if (err) {
            console.error('Error accessing clean file', err);
            event.reply('get-clean-response', { song, exists: false });
        } else if (stats.isFile()) {
            console.log(`Clean file found for ${song}`);
            event.reply('get-clean-response', { song, exists: true, cleanPath: cleanFilePath });
        } else {
            console.log(`No clean file found for ${song}`);
            event.reply('get-clean-response', { song, exists: false });
        }
    });
});

ipcMain.on('cleanse', (event, song) => {
    // The path to your Python script
    const scriptPath = path.join(__dirname, 'src/Find_Clean_Song.py');
    
    // The output directory for the downloaded clean version
    const outputDirectory = path.join(__dirname, 'audio_input/cleaned_songs');

    // Construct the command to run the Python script with arguments
    const command = `python "${scriptPath}" "${song.replace(/\.[^/.]+$/, "")}" "${outputDirectory}"`;

    // Execute the Python script using the constructed command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during the cleansing process: ${stderr}`);
            event.reply('cleanse-complete', { success: false, error: stderr });
        } else {
            // Assuming the script prints the path to the cleaned song
            console.log(`Cleaned song created: ${stdout.trim()}`);
            event.reply('cleanse-complete', { success: true, path: stdout.trim() });
        }
    });
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('check-for-new-files', (event, song) => {
    const baseName = path.basename(song, path.extname(song));
    let instrumentals = [];
    let vocals = [];
    let cleans = [];
    let songs = [];

    // Check for songs
    if (fs.existsSync(songsPath)) {
        songs.push(songsPath);
    }

    // Check for instrumental
    const instrumentalPath = path.join(__dirname, `./audio_input/vocals_instrumentals/${baseName}/instrumental.mp3`);
    if (fs.existsSync(instrumentalPath)) {
        instrumentals.push(instrumentalPath);
    }

    // Check for vocals
    const vocalsPath = path.join(__dirname, `./audio_input/vocals_instrumentals/${baseName}/vocals.mp3`);
    if (fs.existsSync(vocalsPath)) {
        vocals.push(vocalsPath);
    }

    // Check for clean version
    const cleanFilePath = path.join(__dirname, `./audio_input/cleaned_songs/${baseName}(C).mp3`);
    if (fs.existsSync(cleanFilePath)) {
        cleans.push(cleanFilePath);
    }

    event.reply('update-files-response', {
        song: song,
        instrumentals: instrumentals,
        vocals: vocals,
        cleans: cleans
    });
});

ipcMain.on('move-song-to-mp3', (event, songPath) => {
    // Extract the folder name which is considered the song name
    const songName = path.basename(path.dirname(songPath));
    
    // Determine if it's an instrumental or a vocal based on the file name
    let typeSuffix = '';
    if (songPath.toLowerCase().includes('instrumental')) {
        typeSuffix = ' - Instrumental';
    } else if (songPath.toLowerCase().includes('vocal')) {
        typeSuffix = ' - Vocal';
    }
    
    // Construct the new file name using the song name and the type suffix
    const newFileName = songName + typeSuffix + '.mp3';
    const destinationPath = path.join(songsPath, newFileName);

    // Move the file to the songs-mp3 folder
    fs.move(songPath, destinationPath, { overwrite: true })
       .then(() => {
            console.log(`Song moved to ${destinationPath}`);
            event.reply('move-song-to-mp3-reply', { success: true, message: 'Song moved successfully!', newFileName });
       })
       .catch(err => {
            console.error('Error moving the song:', err);
            event.reply('move-song-to-mp3-reply', { success: false, message: err.message });
       });

});

ipcMain.on('move-clean-song', (event, songPath) => {
    const destinationPath = path.join(songsPath, path.basename(songPath));

    // Move the file to the songs-mp3 folder
    fs.move(songPath, destinationPath, { overwrite: true }, (err) => {
        if (err) {
            console.error('Error moving the song:', err);
            event.reply('move-song-to-mp3-reply', { success: false, message: err.message });
        } else {
            console.log(`Song moved to ${destinationPath}`);
            event.reply('move-song-to-mp3-reply', { success: true, message: 'Song moved successfully!' });
        }
    });
});

