// src/components/Messages/Avatar.jsx
import { getAvatar, getAvatarColors, getDisplayName, getInitial, idOf } from './messageUtils';

export default function Avatar({ party, size = 40, ring = false }) {
  const src = getAvatar(party);
  const colors = getAvatarColors(String(idOf(party) || getDisplayName(party)));
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  const cls = `ms-avatar${ring ? ' is-ring' : ''}`;

  if (src) return <img className={cls} src={src} alt="" style={style} />;
  return (
    <span className={cls} style={{ ...style, background: colors.bg, color: colors.fg }} aria-hidden="true">
      {getInitial(party)}
    </span>
  );
}