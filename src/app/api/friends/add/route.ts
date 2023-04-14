import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { fetchRedis } from '@/helpers/redis'
import { addFriendValidator } from '@/lib/validations/add-friends'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email: emailToAdd } = addFriendValidator.parse(body.email)

    const idToAdd = (await fetchRedis(
      'get',
      `user:email:${emailToAdd}`
    )) as string

    if (!idToAdd) {
      return new Response("This person don't exist.", { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannnot add yourself as friend !', {
        status: 400,
      })
    }

    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1

    if (isAlreadyAdded) {
      return new Response('Member already added.', { status: 400 })
    }

    const isAlreadyFriend = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1

    if (isAlreadyFriend) {
      return new Response('Member is already a friend.', { status: 400 })
    }

    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    )

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}
