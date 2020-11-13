cat futuroscope02.base | awk 'BEGIN{srand();} { print "myGis,nom=" $1 ",lat=" $2 ",lon=" $3 " mag=" 0.5 + (rand() * 12) ",dur=" 10.0 + (rand() * 100)  }' > futuroscope02.lp

