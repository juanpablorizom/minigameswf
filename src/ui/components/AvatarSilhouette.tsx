import { Avatar } from './Avatar';
import { DEFAULT_AVATAR_ID } from '../../data/avatarCatalog';

type AvatarSilhouetteProps = {
  size?: number;
  avatarId?: string | null;
  frameId?: string | null;
};

export function AvatarSilhouette({ size = 44, avatarId = DEFAULT_AVATAR_ID, frameId = 'plain' }: AvatarSilhouetteProps) {
  return <Avatar size={size} avatarId={avatarId} frameId={frameId} />;
}
