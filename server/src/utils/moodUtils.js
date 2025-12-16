export const moodScore = (mood) => {
  switch (mood) {
    case 'Great':
      return 5
    case 'Good':
      return 4
    case 'Okay':
      return 3
    case 'Low':
      return 2
    case 'Stressed':
    case 'Anxious':
      return 1
    default:
      return 0
  }
}

