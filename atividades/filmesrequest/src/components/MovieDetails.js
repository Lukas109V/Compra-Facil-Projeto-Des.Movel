import React from "react";
import { ActivityIndicator, Button, Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MoviePoster from "./MoviePoster.js";
import { formatRating, formatReleaseDate } from "../tmdb/movies.js";
import styles from "../styles.js";

export default function MovieDetails({ visible, movie, loading, error, useAxios, onClose, onRetry }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={styles.overlay}>
      <View style={styles.dialog} accessibilityViewIsModal>
        <Text style={styles.header}>Detalhes do filme</Text>
        <Text style={styles.subtle}>Consulta com {useAxios ? "axios" : "fetch"}</Text>
        <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.detailsContent}>
          {loading && <ActivityIndicator accessibilityLabel="Carregando detalhes" size="large" color="#245594" />}
          {!!error && <>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <Button title="Tentar detalhes novamente" onPress={onRetry} disabled={loading} />
          </>}
          {!loading && !error && movie && <>
            <MoviePoster uri={movie.posterUrl} title={movie.title} large />
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.metadata}>Nota média: {formatRating(movie.voteAverage)}</Text>
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.body}>{movie.overview || "Sinopse não informada."}</Text>
            <Text style={styles.sectionTitle}>Duração</Text>
            <Text style={styles.body}>{movie.runtime ? `${movie.runtime} minutos` : "Duração não informada."}</Text>
            <Text style={styles.sectionTitle}>Gêneros</Text>
            <Text style={styles.body}>{movie.genres.length ? movie.genres.join(", ") : "Gêneros não informados."}</Text>
            <Text style={styles.sectionTitle}>Data de lançamento</Text>
            <Text style={styles.body}>{formatReleaseDate(movie.releaseDate)}</Text>
          </>}
        </ScrollView>
        <Button title="Fechar detalhes" onPress={onClose} />
      </View>
    </SafeAreaView>
  </Modal>;
}
