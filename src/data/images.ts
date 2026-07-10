// Free-to-use Unsplash photos (equipment / environment shots, no identifiable
// people). All verified to resolve at time of writing. Swap any `url` for your
// own shots any time — same shape.
export interface GymImage {
  url: string
  alt: string
  credit: string
}

function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
}

// Wide gym interior — used behind the onboarding hero
export const heroImage: GymImage = {
  url: unsplash('photo-1649068610862-ed43a08442cf', 2000),
  alt: 'Black and white photo of a gym interior',
  credit: 'Andrew Kayani / Unsplash',
}

// Close barbell shot — used behind the dashboard hero
export const dashboardImage: GymImage = {
  url: unsplash('photo-1646492169621-d8da8016354a', 2000),
  alt: 'Black and white photo of a barbell in a gym',
  credit: 'Benjamin Brunner / Unsplash',
}

export const goalImages: Record<string, GymImage> = {
  'weight-loss': {
    url: unsplash('photo-1646656130703-8f95eed6a79b'),
    alt: 'Gym with a black and white checkered floor',
    credit: 'Ambitious Studio | Rick Barrett / Unsplash',
  },
  bulking: {
    url: unsplash('photo-1683889843123-5eca2abfd882'),
    alt: 'Black and white photo of a barbell in a gym',
    credit: 'HamZa Nouasria / Unsplash',
  },
  cutting: {
    url: unsplash('photo-1672344048213-76b6e77304bd'),
    alt: 'Black and white photo of a dumbbell',
    credit: 'Pawel Bulwan / Unsplash',
  },
  shredding: {
    url: unsplash('photo-1646492169621-d8da8016354a'),
    alt: 'Black and white photo of a barbell in a gym',
    credit: 'Benjamin Brunner / Unsplash',
  },
}
