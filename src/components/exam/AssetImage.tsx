import type { TestAsset } from "../../domain/examTypes";
import { resolvePublicAssetPath } from "../../utils/assetPath";
import styles from "./AssetImage.module.css";

interface AssetImageProps {
  asset: TestAsset;
}

export function AssetImage({ asset }: AssetImageProps) {
  if (asset.type !== "image") {
    return null;
  }

  return (
    <figure className={styles.figure}>
      <img
        alt={asset.description}
        src={resolvePublicAssetPath(asset.path)}
        draggable={false}
      />
      <figcaption>{asset.description}</figcaption>
    </figure>
  );
}
