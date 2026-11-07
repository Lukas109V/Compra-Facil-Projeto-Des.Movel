import React, { useState } from "react";
import { Image } from "react-native";
import styles from "../styles.js";
import placeholder from "../../assets/poster-placeholder.png";

export default function MoviePoster({ uri, title, large = false }) {
  const [failedUri, setFailedUri] = useState(null);
  const fallback = !uri || failedUri === uri;
  return <Image
    source={fallback ? placeholder : { uri }}
    style={[styles.poster, large && styles.largePoster]}
    resizeMode="cover"
    accessibilityLabel={fallback ? `Poster indisponível: ${title}` : `Poster de ${title}`}
    onError={() => setFailedUri(uri)}
  />;
}
