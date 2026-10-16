#!/bin/sh
# "MOR Collective.app" is retired (16 October 2026, F333): Edubba takes the
# collective client in, as its Collectives tab, and reads ~/mor-collective
# where it is. Make Edubba's app instead; it removes "MOR Collective.app".
here=$(cd "$(dirname "$0")/.." && pwd)
echo "MOR Collective is now part of Edubba. Run instead:"
echo "  sh $here/../desk/scripts/make-app.sh"
exit 1
