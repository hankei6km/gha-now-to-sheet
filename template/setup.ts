#!/usr/bin/env zx
import 'zx/globals'

async function setup(hh: number, mm: number) {
  const hhStr = `${`${hh}`.padStart(2, '0')}`
  const mmStr = `${`${mm}`.padStart(2, '0')}`
  const dst = `.github/workflows/append-${hhStr}-${mmStr}.yaml`
  await $`sed -e 's/HH/'${hhStr}'/' -e 's/MM/'${mmStr}'/' < template/append.yaml > ${dst}`
}

for (let hh = 0; hh < 24; hh++) {
  setup(hh, 13)
  setup(hh, 43)
}
