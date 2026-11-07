import React, { useEffect, useRef, useState } from "react";
import { Button, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from "expo-checkbox";
import MoviePoster from "../components/MoviePoster.js";
import MovieDetails from "../components/MovieDetails.js";
import searchWithFetch from "../tmdb/searchWithFetch.js";
import searchWithAxios from "../tmdb/searchWithAxios.js";
import { movieApi } from "../tmdb/client.js";
import { formatRating, releaseYear } from "../tmdb/movies.js";
import styles from "../styles.js";

export default function MoviesScreen() {
  const [queryText, setQueryText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [movies, setMovies] = useState([]);
  const [useAxios, setUseAxios] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsUseAxios, setDetailsUseAxios] = useState(false);
  const searchRequest = useRef(null);
  const detailsRequest = useRef(null);
  const searchBusy = useRef(false);

  useEffect(() => () => {
    searchRequest.current?.abort();
    detailsRequest.current?.abort();
  }, []);

  async function pesquisar() {
    const query = queryText.trim();
    if (!query || searchBusy.current) return;
    searchBusy.current = true;
    const controller = new AbortController();
    searchRequest.current = controller;
    setIsSearching(true);
    setError("");
    setSearched(false);
    setMovies([]);
    setLastQuery(query);
    try {
      const result = useAxios
        ? await searchWithAxios(query, { signal: controller.signal })
        : await searchWithFetch(query, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setMovies(result);
        setSearched(true);
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      searchBusy.current = false;
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }

  async function loadDetails(movie, selectedMode = useAxios) {
    detailsRequest.current?.abort();
    const controller = new AbortController();
    detailsRequest.current = controller;
    setSelected(movie);
    setDetails(null);
    setDetailsError("");
    setDetailsUseAxios(selectedMode);
    setDetailsLoading(true);
    try {
      const result = await movieApi.details(movie.id, selectedMode, { signal: controller.signal });
      if (!controller.signal.aborted) setDetails(result);
    } catch (failure) {
      if (!controller.signal.aborted) setDetailsError(failure.message);
    } finally {
      if (!controller.signal.aborted) setDetailsLoading(false);
    }
  }

  function closeDetails() {
    detailsRequest.current?.abort();
    setSelected(null);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(false);
  }

  return <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.eyebrow}>ATIVIDADE DE DESENVOLVIMENTO MÓVEL</Text>
      <Text style={styles.header}>Procurar filme</Text>
      <Text style={styles.subtle}>Pesquise um título e toque no filme para ver seus detalhes.</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel="Nome do filme"
        placeholder="Digite o nome de um filme"
        value={queryText}
        onChangeText={setQueryText}
        onSubmitEditing={pesquisar}
        returnKeyType="search"
        editable={!isSearching}
      />
      <View style={styles.checkRow}>
        <Checkbox
          value={useAxios}
          onValueChange={setUseAxios}
          disabled={isSearching}
          accessibilityLabel="Usar axios"
          color={useAxios ? "#245594" : undefined}
        />
        <Text style={styles.checkLabel}>Usar axios (desmarcado = fetch)</Text>
      </View>
      <Button
        title={isSearching ? "Pesquisando..." : "Pesquisar"}
        onPress={pesquisar}
        disabled={isSearching || !queryText.trim()}
      />
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={movies}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={searched && movies.length > 0
          ? <Text style={styles.subtle}>Resultados de “{lastQuery}”</Text> : null}
        ListEmptyComponent={searched && !error
          ? <Text accessibilityLiveRegion="polite" style={styles.empty}>Nenhum filme encontrado</Text> : null}
        renderItem={({ item }) => <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes de ${item.title}`}
          onPress={() => loadDetails(item)}
        >
          <MoviePoster uri={item.posterUrl} title={item.title} />
          <View style={styles.movieInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.metadata}>Lançamento: {releaseYear(item.releaseDate)}</Text>
            <Text style={styles.metadata}>Nota média: {formatRating(item.voteAverage)}</Text>
            <Text style={styles.link}>Ver detalhes</Text>
          </View>
        </Pressable>}
      />
      <Text style={styles.credit}>Dados e imagens: TMDB. Este produto usa a API do TMDB e não é endossado ou certificado pelo TMDB.</Text>
      <MovieDetails
        visible={!!selected}
        movie={details}
        loading={detailsLoading}
        error={detailsError}
        useAxios={detailsUseAxios}
        onClose={closeDetails}
        onRetry={() => selected && loadDetails(selected, detailsUseAxios)}
      />
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
