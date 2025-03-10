package org.habemusrex.media;

import javafx.scene.media.AudioClip;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class MediaManager {

    private final Map<String, MediaPlayer> loopingMediaPlayers;
    private final Map<String, AudioClip> audioClips;

    public MediaManager() {
        loopingMediaPlayers = new HashMap<>();
        audioClips = new HashMap<>();
    }

    public void playSoundEffect(String filePath) {
        AudioClip clip = audioClips.computeIfAbsent(filePath, path ->
                new AudioClip(Objects.requireNonNull(getClass().getResource(path)).toString())
        );
        clip.play();
    }


    public void playLoopingTrack(String filePath, double volume) {
        // Stop any track with the same file path
        stopLoopingTrack(filePath);

        Media media = new Media(Objects.requireNonNull(getClass().getResource(filePath)).toString());
        MediaPlayer player = new MediaPlayer(media);
        player.setCycleCount(MediaPlayer.INDEFINITE);
        player.setVolume(volume);
        player.play();

        loopingMediaPlayers.put(filePath, player);
    }


    public void stopLoopingTrack(String filePath) {
        MediaPlayer player = loopingMediaPlayers.remove(filePath);
        if (player != null) {
            player.stop();
        }
    }


    public void stopAllLoopingTracks() {
        loopingMediaPlayers.values().forEach(MediaPlayer::stop);
        loopingMediaPlayers.clear();
    }

    public void shutdown() {
        stopAllLoopingTracks();
        audioClips.clear();
    }
}
