import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Check JWT_SECRET at runtime instead of module load time
  const JWT_SECRET = process.env.JWT_SECRET as string
  if (!JWT_SECRET) {
    return NextResponse.json({ error: 'Server configuration error: JWT_SECRET not set' }, { status: 500 })
  }
  
  try {
    const { email, password, full_name, phone, isOAuth, oauthId } = await request.json()

    // For OAuth users, we don't require a password
    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      // For OAuth users who already exist, just generate a token and return
      if (isOAuth && existingUser.id) {
        const token = jwt.sign(
          { userId: existingUser.id, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        )
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role, full_name, phone')
          .eq('id', existingUser.id)
          .single()
        
        return NextResponse.json({
          message: 'User logged in successfully',
          token,
          user: profile
        })
      }
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    let profile;
    
    if (isOAuth && oauthId) {
      // Create profile for OAuth user (no password hash needed)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: oauthId,
          email,
          full_name,
          phone: phone || null,
          role: 'client'
        })
        .select()
        .single()

      if (profileError) {
        console.error('OAuth Profile creation error:', profileError)
        return NextResponse.json({ error: 'Failed to create OAuth user profile' }, { status: 500 })
      }
      
      profile = data;
    } else {
      // Regular email/password signup - require password
      if (!password) {
        return NextResponse.json({ error: 'Password is required for email signup' }, { status: 400 })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create user profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          password_hash: passwordHash,
          full_name,
          phone: phone || null,
          role: 'client' // Default role
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      
      profile = newProfile;
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: profile.id, email: profile.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return success (don't return password hash)
    const { password_hash, ...userWithoutPassword } = profile
    return NextResponse.json({
      message: isOAuth ? 'OAuth user created successfully' : 'User created successfully',
      token,
      user: userWithoutPassword
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}