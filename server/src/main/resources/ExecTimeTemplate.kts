$$$imports$$$
val timeSource = kotlin.time.TimeSource.Monotonic; val startTheScriptTimeRandomName = timeSource.markNow();
$$$content$$$
val stopTheScriptTimeRandomName = timeSource.markNow();
println("EXECTIME" + (stopTheScriptTimeRandomName - startTheScriptTimeRandomName).inWholeMicroseconds.toDouble() / 1000 + "ms")
