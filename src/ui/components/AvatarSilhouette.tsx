import { Avatar } from './Avatar';

type AvatarSilhouetteProps = {
  size?: number;
  avatarId?: string | null;
  frameId?: string | null;
};

export function AvatarSilhouette({ size = 44, avatarId = 'default', frameId = 'plain' }: AvatarSilhouetteProps) {
  return <Avatar size={size} avatarId={avatarId} frameId={frameId} />;
}
