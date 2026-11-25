package registry

import (
    "std"
    "strings"
    "testing"
)

func TestRegisterAndGetScenario(t *testing.T) {
    std.TestSetOrigCaller("g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5")
    before := GetScenarioCount()
    id := RegisterScenario("First scenario", "gno.land/r/demo/boards", "payload")
    if id != before+1 || GetScenarioCount() != before+1 { t.Fatal("scenario was not registered") }
    if !strings.Contains(GetScenario(id), "First scenario") { t.Fatal("scenario was not returned") }
    if GetScenario(0) != "" { t.Fatal("invalid ID should return empty string") }
}

func TestRender(t *testing.T) {
    std.TestSetOrigCaller("g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5")
    RegisterScenario("Render test", "gno.land/r/demo/boards", "payload")
    if !strings.Contains(Render(""), "Render test") { t.Fatal("render missing scenario") }
}
